from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
import hashlib
from app.core.database import get_db
from app.models.user import APIKey, Company
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# --- DEPENDENCIA DE SEGURIDAD PARA TERCEROS ---
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

async def validate_external_auth(
    x_client_id: str = Header(...),
    x_api_key: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    # Hashear la llave recibida para comparar
    hashed_received = hashlib.sha256(x_api_key.encode()).hexdigest()
    
    result = await db.execute(
        select(APIKey).where(
            APIKey.client_id == x_client_id,
            APIKey.hashed_key == hashed_received,
            APIKey.is_active == True
        )
    )
    db_key = result.scalar_one_or_none()

    if not db_key:
        raise HTTPException(status_code=401, detail="Credenciales de API inválidas o inactivas")
    
    # Actualizar último uso
    db_key.last_used = func.now()
    await db.commit()
    
    return db_key.company_id

# --- ESQUEMAS PARA EXTERNOS ---
class ExternalTicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "normal"
    requester_email: str
    metadata: Optional[dict] = None

@router.post("/tickets")
async def create_external_ticket(
    ticket_in: ExternalTicketCreate,
    company_id: int = Depends(validate_external_auth),
    db: AsyncSession = Depends(get_db)
):
    # Aquí iría la lógica para crear el ticket vinculado a la empresa
    # Por ahora devolvemos un éxito simulado
    return {
        "status": "success",
        "ticket_id": f"EXT-{hashlib.md5(ticket_in.subject.encode()).hexdigest()[:8].upper()}",
        "message": "Ticket creado correctamente vía API Externa",
        "company_context_id": company_id
    }
