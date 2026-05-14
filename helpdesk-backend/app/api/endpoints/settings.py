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
from app.schemas.task import AutomatedTaskOut, AutomatedTaskCreate, AutomatedTaskUpdate

router = APIRouter()

@router.get("/company")
async def get_company_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    try:
        result = await db.execute(select(Company).where(Company.id == current_user.company_id))
        company = result.scalar_one_or_none()
        if not company:
            return {
                "id": 0, "name": "Empresa no registrada", "tax_id": "", "logo_url": None,
                "address": "", "phone": "", "auto_close_tickets": True,
                "ai_maintenance_analyst": True, "stock_check_alert": False
            }
            
        return {
            "id": company.id,
            "name": company.name,
            "tax_id": company.tax_id,
            "logo_url": company.logo_url,
            "address": company.address,
            "phone": company.phone,
            "prefix": company.prefix,
            "auto_close_tickets": company.auto_close_tickets,
            "ai_maintenance_analyst": company.ai_maintenance_analyst,
            "stock_check_alert": company.stock_check_alert
        }
    except Exception as e:
        print(f"❌ ERROR EN GET_COMPANY: {str(e)}")
        return { "id": 0, "name": "Verificación de Operatividad Técnica", "logo_url": None }

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

@router.patch("/departments/{dept_id}", response_model=DepartmentOut)
async def update_department(
    dept_id: int,
    dept_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Department
    await db.execute(
        update(Department)
        .where(Department.id == dept_id)
        .values(name=dept_in.get("name"))
    )
    await db.commit()
    result = await db.execute(select(Department).where(Department.id == dept_id))
    return result.scalar_one()

@router.delete("/departments/{dept_id}")
async def delete_department(
    dept_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Department
    from sqlalchemy import delete
    await db.execute(delete(Department).where(Department.id == dept_id))
    await db.commit()
    return {"status": "deleted"}

@router.post("/categories", response_model=CategoryOut)
async def create_category(
    cat_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Category
    db_cat = Category(
        name=cat_in.get("name"), 
        department_id=cat_in.get("department_id"),
        company_id=current_user.company_id
    )
    db.add(db_cat)
    await db.commit()
    await db.refresh(db_cat)
    return db_cat

@router.delete("/categories/{cat_id}")
async def delete_category(
    cat_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.ticket import Category
    from sqlalchemy import delete
    await db.execute(delete(Category).where(Category.id == cat_id))
    await db.commit()
    return {"status": "deleted"}

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

@router.get("/automated-tasks")
async def get_automated_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.task import AutomatedTask
    try:
        result = await db.execute(
            select(AutomatedTask).where(
                (AutomatedTask.company_id == current_user.company_id)
            )
        )
        tasks = result.scalars().all()
        return [{
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "is_active": t.is_active,
            "is_system": t.is_system,
            "schedule_type": t.schedule_type if hasattr(t, 'schedule_type') else 'daily',
            "day_of_week": t.day_of_week if hasattr(t, 'day_of_week') else None,
            "day_of_month": t.day_of_month if hasattr(t, 'day_of_month') else None,
            "scheduled_time": t.scheduled_time if hasattr(t, 'scheduled_time') else '00:00',
            "last_run": t.last_run.isoformat() if t.last_run and hasattr(t.last_run, 'isoformat') else None
        } for t in tasks]
    except Exception as e:
        print(f"❌ ERROR EN GET_AUTOMATED_TASKS: {str(e)}")
        return [] # Return empty list on error to unblock UI

@router.post("/automated-tasks", response_model=AutomatedTaskOut)
async def create_automated_task(
    task_in: AutomatedTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.task import AutomatedTask
    db_task = AutomatedTask(
        **task_in.model_dump(),
        company_id=current_user.company_id,
        created_by_id=current_user.id,
        is_system=False # Usuarios nunca crean tareas de sistema
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.patch("/automated-tasks/{task_id}", response_model=AutomatedTaskOut)
async def update_automated_task(
    task_id: int,
    task_in: AutomatedTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.task import AutomatedTask
    from app.models.user import Role
    
    # Obtener el rol para verificar si es SuperAdmin
    result = await db.execute(select(Role).where(Role.id == current_user.role_id))
    role = result.scalar_one_or_none()
    is_superadmin = role and role.name.lower() == "superadmin"

    query = select(AutomatedTask).where(AutomatedTask.id == task_id)
    result = await db.execute(query)
    db_task = result.scalar_one_or_none()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    # Protección: Si es tarea de sistema, solo SuperAdmin edita
    if db_task.is_system and not is_superadmin:
        raise HTTPException(status_code=403, detail="Solo el SuperAdmin puede editar tareas del sistema")
        
    # Si no es de sistema, verificar que sea de su empresa
    if not db_task.is_system and db_task.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta tarea")

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
        
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.delete("/automated-tasks/{task_id}")
async def delete_automated_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.task import AutomatedTask
    from sqlalchemy import delete
    
    query = select(AutomatedTask).where(AutomatedTask.id == task_id)
    result = await db.execute(query)
    db_task = result.scalar_one_or_none()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    if db_task.is_system:
        raise HTTPException(status_code=403, detail="Las tareas del sistema no se pueden eliminar")
        
    await db.execute(delete(AutomatedTask).where(AutomatedTask.id == task_id))
    await db.commit()
    return {"status": "deleted"}
