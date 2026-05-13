from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.models.inventory import Assignment, Product
from app.models.user import User
from app.services.act_service import act_service
from app.utils.sequence import get_next_sequence
from app.api import deps

router = APIRouter()

@router.post("/")
async def create_assignment(
    assign_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Generar código de acta
    act_code = await get_next_sequence(db, "acta", "ACT")
    
    db_assign = Assignment(
        product_id=assign_in.get("product_id"),
        user_id=assign_in.get("user_id"),
        company_id=current_user.company_id,
        condition_on_delivery=assign_in.get("condition", "Excelente"),
        act_code=act_code
    )
    
    # Cambiar estado del producto a ASIGNADO
    product = await db.get(Product, assign_in.get("product_id"))
    if product:
        product.status = "ASIGNADO"
    
    db.add(db_assign)
    await db.commit()
    return db_assign

@router.get("/{assignment_id}/acta")
async def get_legal_act(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    acta = await act_service.generate_legal_act_json(db, assignment_id)
    if not acta:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return acta
