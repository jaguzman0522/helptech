from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.user import User, Role
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Lista todos los roles disponibles para la empresa del usuario"""
    result = await db.execute(
        select(Role).where(
            (Role.company_id == current_user.company_id) | (Role.is_system == True)
        )
    )
    return result.scalars().all()

@router.post("/")
async def create_role(
    role_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Crea un nuevo rol con permisos personalizados en JSON"""
    db_role = Role(
        name=role_in.get("name"),
        description=role_in.get("description"),
        permissions=role_in.get("permissions", {}),
        company_id=current_user.company_id,
        is_system=False
    )
    db.add(db_role)
    await db.commit()
    await db.refresh(db_role)
    return db_role

@router.patch("/{role_id}")
async def update_role(
    role_id: int,
    role_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Actualiza la matriz de permisos de un rol"""
    result = await db.execute(select(Role).where(Role.id == role_id))
    db_role = result.scalar_one_or_none()
    
    if not db_role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    if db_role.is_system:
        raise HTTPException(status_code=403, detail="No se pueden modificar roles del sistema")

    for key, value in role_in.items():
        setattr(db_role, key, value)
        
    await db.commit()
    await db.refresh(db_role)
    return db_role
