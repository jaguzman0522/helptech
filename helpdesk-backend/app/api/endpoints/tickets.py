from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime
from typing import List, Optional

from app.core.config import settings
from app.core.database import get_db, AsyncSessionLocal
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.user import User
from app.models.sequence import Sequence
from app.schemas.ticket import TicketCreate, TicketOut
from app.api import deps
from app.services.document_service import document_service
from app.services.learning_service import learning_service
from app.services.ai_classifier import classify_ticket_task
from app.services.assignment import auto_assign_technician
from app.services.notification_service import notification_service
from app.utils.sequence import get_next_sequence
from app.core.middleware import log_action

from app.services.image_service import image_service
import os

router = APIRouter()

@router.post("/upload-evidence")
async def upload_evidence(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.check_permission("tickets", "editar")),
):
    try:
        # Optimización en tiempo real: Redimensionar y Convertir a WebP
        optimized_content = await image_service.optimize_image(file)
        
        # Generar nombre único
        file_name = f"evidence_{datetime.now().timestamp()}.webp"
        file_path = f"static/evidence/{file_name}"
        os.makedirs("static/evidence", exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(optimized_content)
            
        return {"url": f"http://localhost:8001/{file_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al optimizar imagen: {str(e)}")


@router.get("/summary/stats")
async def get_summary_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "ver")),
):
    from sqlalchemy import func
    # Count tickets by status for the current company
    try:
        query = select(Ticket.status, func.count(Ticket.id)).where(Ticket.company_id == current_user.company_id).group_by(Ticket.status)
        result = await db.execute(query)
        rows = result.all()
        
        # Mapeo manual para evitar errores de Enum
        stats_map = {str(row[0]): row[1] for row in rows}
        
        return {
            "open": stats_map.get("ABIERTO", 0) + stats_map.get("OPEN", 0),
            "in_progress": stats_map.get("EN_PROGRESO", 0) + stats_map.get("IN_PROGRESS", 0),
            "resolved": stats_map.get("RESUELTO", 0) + stats_map.get("RESOLVED", 0),
            "total": sum(stats_map.values())
        }
    except Exception as e:
        print(f"Error en stats: {e}")
        return {"open": 0, "in_progress": 0, "resolved": 0, "total": 0}

@router.post("/", response_model=TicketOut)
async def create_ticket(
    ticket_in: TicketCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "crear")),
):
    code = await get_next_sequence(db, "ticket", "TK")
    
    # Auto-assign technician if possible
    tech_id = None
    try:
        tech_id = await auto_assign_technician(db, ticket_in.department_id, current_user.company_id)
    except Exception:
        pass
    
    db_ticket = Ticket(
        code=code,
        title=ticket_in.title,
        description=ticket_in.description,
        priority=ticket_in.priority,
        status=TicketStatus.OPEN,
        company_id=current_user.company_id,
        department_id=ticket_in.department_id,
        category_id=ticket_in.category_id,
        requester_id=current_user.id,
        requester_name=current_user.full_name,
        # requester_dept logic would go here if User has department relation
        technician_id=tech_id,
        asset_id=ticket_in.asset_id,
        photo_before=ticket_in.photo_before
    )
    
    db.add(db_ticket)
    await db.commit()
    await db.refresh(db_ticket)
    
    # Audit Logging
    background_tasks.add_task(
        log_action(current_user.id, "create_ticket", "ticket", db_ticket.id, {"code": db_ticket.code})
    )
    
    # Notifications
    if tech_id:
        background_tasks.add_task(
            notification_service.create_notification,
            db, 
            tech_id,
            "Nuevo Ticket Asignado",
            f"Se te ha asignado el ticket {db_ticket.code}: {db_ticket.title}",
            notif_type="ticket_assignment",
            url=f"/dashboard/tickets/{db_ticket.id}"
        )
    
    # AI Classification task
    if settings.GEMINI_API_KEY:
        background_tasks.add_task(
            classify_ticket_task, 
            db_ticket.id, 
            db_ticket.description, 
            AsyncSessionLocal
        )
    
    return db_ticket

@router.get("/", response_model=List[TicketOut])
async def list_tickets(
    status: Optional[str] = None,
    origin: Optional[str] = None, # 'INTERNAL' o 'EXTERNAL'
    source: Optional[str] = None, # Nombre de la app externa
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "ver")),
):
    query = select(Ticket)
    
    # Restricción multi-tenant
    if current_user.role != "superadmin":
        query = query.where(Ticket.company_id == current_user.company_id)
    
    # Filtros dinámicos
    if status:
        query = query.where(Ticket.status == status)
    
    if origin == "EXTERNAL":
        query = query.where(Ticket.external_source.isnot(None))
    elif origin == "INTERNAL":
        query = query.where(Ticket.external_source.is_(None))
        
    if source:
        query = query.where(Ticket.external_source == source)
        
    result = await db.execute(query.order_by(Ticket.created_at.desc()))
    return result.scalars().all()

@router.get("/recent-chats")
async def get_recent_chats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "responder")),
):
    from app.models.ticket import ChatMessage
    # Subquery para obtener el último mensaje por ticket
    from sqlalchemy import desc
    
    # Obtenemos los tickets donde el usuario participa o tiene acceso
    query = select(Ticket).where(Ticket.company_id == current_user.company_id)
    if current_user.role == "technician":
        query = query.where(Ticket.technician_id == current_user.id)
    elif current_user.role == "user":
        query = query.where(Ticket.requester_id == current_user.id)
        
    result = await db.execute(query.order_by(Ticket.updated_at.desc()))
    tickets = result.scalars().all()
    
    chats = []
    for t in tickets:
        # Buscar el último mensaje
        msg_result = await db.execute(
            select(ChatMessage).where(ChatMessage.ticket_id == t.id).order_by(desc(ChatMessage.created_at)).limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()
        chats.append({
            "ticket_id": t.id,
            "ticket_code": t.code,
            "ticket_title": t.title,
            "last_message": last_msg.message if last_msg else "Sin mensajes aún",
            "last_activity": last_msg.created_at if last_msg else t.created_at,
            "status": t.status
        })
    
    return chats
@router.get("/{ticket_id}/document")
async def get_ticket_document(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "ver")),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket or ticket.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    data = {
        "codigo": ticket.code,
        "asunto": ticket.title,
        "descripcion": ticket.description,
        "estado": ticket.status,
        "prioridad": ticket.priority,
        "tecnico": ticket.technician_id,
        "cliente": ticket.requester_name,
        "fecha_resolucion": ticket.updated_at.isoformat() if ticket.status == "RESUELTO" else "PENDIENTE"
    }
    
    return await document_service.certify_document(db, "REPORTE_DE_SERVICIO", data, current_user.company_id)

@router.post("/{ticket_id}/reasign")
async def reasign_ticket(
    ticket_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "editar")),
):
    from app.models.ticket import ChatMessage, Department, Category
    
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    old_dept_id = ticket.department_id
    new_dept_id = payload.get("department_id")
    new_cat_id = payload.get("category_id")
    reason = payload.get("reason", "Reasignación manual")
    
    # 1. Actualizar Ticket y Limpiar Técnico
    ticket.department_id = new_dept_id
    ticket.category_id = new_cat_id
    ticket.technician_id = None # Se limpia para que el nuevo área asigne
    
    # 2. Registrar Aprendizaje (Peso Doble)
    learning_service.registrar_correccion(ticket.description, new_cat_id, motivo=reason)
    
    # 3. Mensaje del Sistema en el Chat
    result_dept = await db.execute(select(Department.name).where(Department.id == new_dept_id))
    dept_name = result_dept.scalar_one_or_none() or "Nuevo Departamento"
    
    system_msg = ChatMessage(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=f"SISTEMA: Ticket reasignado a {dept_name}. Motivo: {reason}",
        is_internal=False
    )
    db.add(system_msg)
    
    # 4. Auditoría
    await log_action(db, current_user.id, current_user.company_id, "REASIGNACION_TICKET", {
        "ticket_id": ticket.id,
        "from_dept": old_dept_id,
        "to_dept": new_dept_id,
        "reason": reason
    })
    
    # 5. Notificar Webhook si es Externo
    if ticket.external_source:
        from app.services.webhook_service import webhook_service
        from app.models.external_app import ExternalApp
        
        # Buscar la app externa por el prefijo/nombre
        result_app = await db.execute(select(ExternalApp).where(ExternalApp.company_id == current_user.company_id))
        ext_app = result_app.scalars().first() # Simplificado: toma la primera app de la empresa
        
        if ext_app:
            background_tasks.add_task(
                webhook_service.trigger_webhook,
                AsyncSessionLocal, # Pasamos el factory para que el service cree su propia sesión
                ext_app.id,
                "ticket.updated",
                {
                    "ticketId": ticket.id,
                    "codigo": ticket.code,
                    "nuevoEstado": ticket.status,
                    "resolucion": reason,
                    "tecnicoAsignado": current_user.full_name
                }
            )
    
    await db.commit()
    return {"status": "success", "message": f"Ticket reasignado a {dept_name}"}

@router.patch("/{ticket_id}")
async def update_ticket(
    ticket_id: int,
    ticket_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "editar")),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
    # Hook de Aprendizaje: Si se cambia la categoría manualmente
    if "category_id" in ticket_in and ticket_in["category_id"] != ticket.category_id:
        learning_service.registrar_correccion(ticket.description, ticket_in["category_id"])

    for key, value in ticket_in.items():
        setattr(ticket, key, value)
        
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "ver")),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/{ticket_id}/messages")
async def send_chat_message(
    ticket_id: int,
    message_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "responder")),
):
    from app.models.ticket import ChatMessage
    db_message = ChatMessage(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=message_in.get("message"),
        is_internal=message_in.get("is_internal", False)
    )
    db.add(db_message)
    await db.commit()
    return {"status": "sent"}

@router.get("/{ticket_id}/messages")
async def list_chat_messages(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "ver")),
):
    from app.models.ticket import ChatMessage
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.ticket_id == ticket_id)
        .order_by(ChatMessage.created_at.asc())
    )
    return result.scalars().all()

@router.post("/{ticket_id}/evidence")
async def upload_evidence(
    ticket_id: int,
    type: str, # "before" o "after"
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_permission("tickets", "editar"))
):
    """
    Sube evidencia fotográfica (Antes/Después) para un ticket.
    """
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado.")

    try:
        file_url = await image_service.save_evidence(file, ticket_id, type)
        
        if type == "before":
            ticket.photo_before = file_url
        else:
            ticket.photo_after = file_url
            
        await db.commit()
        return {"success": True, "url": file_url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {str(e)}")
