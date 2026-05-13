from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import List

from app.core.database import get_db
from app.models.user import Company, User
from app.models.ticket import Ticket
from app.api import deps
from app.schemas.user import CompanyOut

router = APIRouter()

@router.get("/stats/global")
async def get_global_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # SEGURIDAD CRÍTICA: Solo Empresa ID 1 y Rol SuperAdmin
    role_name = current_user.role.name if current_user.role else current_user.role_name
    if current_user.company_id != 1 or role_name != "superadmin":
        raise HTTPException(status_code=403, detail="Acceso denegado: Se requiere privilegios de SuperAdmin")

    # KPIs de Negocio
    total_companies_result = await db.execute(select(func.count(Company.id)))
    active_companies_result = await db.execute(select(func.count(Company.id)).where(Company.is_active == True))
    total_tickets_all_result = await db.execute(select(func.count(Ticket.id)))
    
    total_companies = total_companies_result.scalar()
    active_companies = active_companies_result.scalar()
    total_tickets_system = total_tickets_all_result.scalar()
    
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "total_tickets_system": total_tickets_system,
        "mrr_estimate": active_companies * 49.99, # Mock price per company
        "growth_rate": "+8.5%"
    }

@router.get("/companies", response_model=List[CompanyOut])
async def list_all_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    role_name = current_user.role.name if current_user.role else current_user.role_name
    if current_user.company_id != 1 or role_name != "superadmin":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    result = await db.execute(select(Company))
    return result.scalars().all()

@router.post("/companies/{company_id}/toggle-status")
async def toggle_company_status(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    role_name = current_user.role.name if current_user.role else current_user.role_name
    if current_user.company_id != 1 or role_name != "superadmin":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    company.is_active = not company.is_active
    await db.commit()
    return {"status": "success", "is_active": company.is_active}
