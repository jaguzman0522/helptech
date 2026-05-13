from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db, AsyncSessionLocal
from app.models.inventory import Product
from app.models.user import Company
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.services.ai_classifier import classify_ticket_task
import qrcode
import io

router = APIRouter()

@router.get("/asset/{token}")
async def get_public_asset(token: str, db: AsyncSession = Depends(get_db)):
    """
    Obtiene información filtrada de un activo para el portal público.
    """
    result = await db.execute(
        select(Product, Company)
        .join(Company, Product.company_id == Company.id)
        .where(Product.public_token == token)
    )
    data = result.first()
    
    if not data:
        raise HTTPException(status_code=404, detail="Activo no encontrado o token inválido.")
    
    product, company = data
    
    # PROTECCIÓN: Si el equipo es robado o dado de baja, no mostrar datos sensibles
    if product.status in ["ROBADO", "BAJA"]:
        return {
            "error": True,
            "status": product.status,
            "message": "Este equipo ha sido reportado como ROBADO o INACTIVO. El acceso ha sido bloqueado por seguridad.",
            "company_name": company.name
        }

    # Data Scrubbing: Solo enviar lo necesario
    return {
        "success": True,
        "data": {
            "code": product.code,
            "name": product.name,
            "category": "Equipos de Cómputo", # Simplificado
            "status": product.status,
            "serial_number": product.serial_number,
            "warranty_until": product.warranty_end_date,
            "photo_url": "https://placehold.co/600x400/0f172a/white?text=Foto+del+Equipo", # Placeholder
            "company": {
                "name": company.name,
                "logo_url": "https://placehold.co/200x200/2563eb/white?text=Logo"
            }
        }
    }

@router.post("/asset/{token}/report")
async def public_report_failure(
    token: str, 
    description: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Permite a un invitado reportar una falla sin estar registrado, incluyendo foto opcional.
    """
    result = await db.execute(select(Product).where(Product.public_token == token))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Activo no válido.")

    if product.status == "ROBADO":
         raise HTTPException(status_code=403, detail="No se pueden reportar fallas en equipos robados.")

    photo_url = None
    if file:
        try:
            # Usar un ID temporal para el nombre hasta tener el ID real del ticket
            # O mejor, crear el ticket primero y luego subir la foto
            pass
        except Exception:
            pass

    # Crear Ticket Automático
    new_ticket = Ticket(
        title=f"Reporte Público: {product.name}",
        description=description,
        status=TicketStatus.OPEN,
        priority=TicketPriority.MEDIUM,
        company_id=product.company_id,
        asset_id=product.id,
        requester_name="Invitado Público (QR Scan)",
        external_source="QR_PORTAL"
    )
    
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)

    # Si hay foto, procesarla ahora que tenemos el ticket_id
    if file:
        from app.services.image_service import image_service
        try:
            photo_url = await image_service.save_evidence(file, new_ticket.id, "public-report")
            new_ticket.photo_before = photo_url
            await db.commit()
        except Exception:
            pass
    
    # Disparar Clasificación IA en segundo plano
    background_tasks.add_task(classify_ticket_task, new_ticket.id, AsyncSessionLocal)
    
    return {
        "success": True, 
        "ticket_code": f"TK-PUB-{new_ticket.id}",
        "message": "Tu reporte ha sido recibido. Un técnico será asignado de inmediato."
    }

@router.get("/barcode")
async def generate_qr(text: str):
    """
    Genera un código QR dinámico como imagen PNG usando la librería qrcode.
    """
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convertir a buffer de imagen
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
