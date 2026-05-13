from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hashlib
from typing import Optional, List

from app.core.database import get_db
from app.models.external_app import ExternalApp
from app.models.ticket import Ticket, TicketStatus
from app.utils.sequence import get_next_sequence
from app.services.assignment import auto_assign_technician
from app.api import deps

router = APIRouter()

async def get_verified_app(
    db: AsyncSession = Depends(get_db),
    x_client_id: str = Header(...),
    x_api_key: str = Header(...)
) -> ExternalApp:
    # 1. Buscar la app por Client ID
    result = await db.execute(select(ExternalApp).where(ExternalApp.client_id == x_client_id))
    app = result.scalar_one_or_none()
    
    if not app or not app.is_active:
        raise HTTPException(status_code=401, detail="Client ID inválido o inactivo")
        
    # 2. Validar Hash de la API Key
    api_key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()
    if app.api_key_hash != api_key_hash:
        raise HTTPException(status_code=401, detail="API Key incorrecta")
        
    return app

@router.post("/tickets")
async def create_external_ticket(
    payload: dict,
    app: ExternalApp = Depends(get_verified_app),
    db: AsyncSession = Depends(get_db)
):
    """
    Crea un ticket desde una app externa (ej: VentaSmart)
    """
    # Lógica de Prefijo y Secuencia
    code = await get_next_sequence(db, "ticket", app.prefix)
    
    # Auto-asignación
    tech_id = await auto_assign_technician(db, None, app.company_id)
    
    db_ticket = Ticket(
        code=code,
        title=payload.get("title", "Error Externo Automático"),
        description=payload.get("description", "Sin descripción"),
        priority=payload.get("priority", "MEDIA"),
        status=TicketStatus.OPEN,
        company_id=app.company_id,
        requester_name=f"API: {app.name}",
        technician_id=tech_id,
        external_source=app.name
    )
    
    db.add(db_ticket)
    await db.commit()
    await db.refresh(db_ticket)
    
    return {
        "id": db_ticket.id,
        "code": db_ticket.code,
        "status": db_ticket.status,
        "assigned_to": tech_id or "Pendiente de asignación"
    }

@router.get("/tickets/{ticket_id}")
async def get_external_ticket_status(
    ticket_id: int,
    app: ExternalApp = Depends(get_verified_app),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket or ticket.company_id != app.company_id:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
    return {
        "code": ticket.code,
        "status": ticket.status,
        "updated_at": ticket.updated_at
    }
