from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from app.core.database import get_db
from app.models.user import Company
from app.models.sequence import Sequence
from app.models.user import User
from app.api import deps
from app.schemas.ticket import DepartmentOut, CategoryOut

router = APIRouter()

@router.get("/company")
async def get_company_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Company).where(Company.id == current_user.company_id))
    return result.scalar_one_or_none()

@router.patch("/company")
async def update_company_settings(
    settings_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Atomic update for company identity (Brand White-labeling)
    await db.execute(
        update(Company)
        .where(Company.id == current_user.company_id)
        .values(**settings_in)
    )
    await db.commit()
    return {"status": "success"}

# Organizacion (Departamentos y Categorias)
@router.get("/departments", response_model=List[DepartmentOut])
async def get_departments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Department
    result = await db.execute(select(Department).where(Department.company_id == current_user.company_id))
    return result.scalars().all()

@router.post("/departments", response_model=DepartmentOut)
async def create_department(
    dept_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Department
    db_dept = Department(name=dept_in.get("name"), company_id=current_user.company_id)
    db.add(db_dept)
    await db.commit()
    return db_dept

@router.get("/categories/{dept_id}", response_model=List[CategoryOut])
async def get_categories_by_dept(
    dept_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Category
    result = await db.execute(select(Category).where(Category.department_id == dept_id))
    return result.scalars().all()

@router.patch("/sequences/{entity}")
async def update_sequence_config(
    entity: str,
    config: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Lógica para cambiar prefijos y formatos de folio
    await db.execute(
        update(Sequence)
        .where(Sequence.entity_name == entity)
        .values(prefix=config.get("prefix"))
    )
    await db.commit()
    return {"status": "success"}

@router.get("/external-apps")
async def get_external_apps(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.external_app import ExternalApp
    result = await db.execute(select(ExternalApp).where(ExternalApp.company_id == current_user.company_id))
    return result.scalars().all()

@router.post("/external-apps")
async def create_external_app(
    app_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.external_app import ExternalApp
    import secrets
    import hashlib
    
    # Generar API Key única
    raw_key = f"hp_sk_live_{secrets.token_hex(16)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    client_id = f"APP-{secrets.token_hex(4).upper()}"
    
    db_app = ExternalApp(
        name=app_in.get("name"),
        client_id=client_id,
        api_key_hash=key_hash,
        prefix=app_in.get("prefix", "EXT"),
        company_id=current_user.company_id
    )
    db.add(db_app)
    await db.commit()
    
    # Devolvemos la clave raw SOLO una vez
    return {
        "id": db_app.id,
        "name": db_app.name,
        "client_id": db_app.client_id,
        "api_key": raw_key,
        "prefix": db_app.prefix
    }
