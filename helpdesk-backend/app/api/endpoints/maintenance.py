from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.core.database import get_db
from app.models.maintenance import Maintenance, MaintenanceType
from app.models.calendar import Event
from app.models.user import User
from app.api import deps
from app.services.notification_service import notification_service
from app.utils.sequence import get_next_sequence

router = APIRouter()

@router.post("/")
async def create_maintenance(
    maint_in: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # 0. Generate Maintenance Code
    maint_code = await get_next_sequence(db, "maintenance", "MNT")

    # 1. Create Maintenance record
    db_maint = Maintenance(
        maint_code=maint_code,
        product_id=maint_in.get("productoId"),
        tecnico_id=maint_in.get("tecnicoId"),
        type=maint_in.get("tipo", MaintenanceType.PREVENTIVO),
        priority=maint_in.get("prioridad", "MEDIA"),
        description=maint_in.get("descripcion"),
        scheduled_date=datetime.fromisoformat(maint_in.get("fechaProgramada")),
        ticket_id=maint_in.get("ticketId")
    )
    db.add(db_maint)
    await db.flush()
    
    # 2. AUTOMATION: Create Calendar Event
    db_event = Event(
        title=f"Mantenimiento {db_maint.type}: {maint_in.get('productoNombre', 'Equipo')}",
        description=db_maint.description,
        start_time=db_maint.scheduled_date,
        type="MANTENIMIENTO",
        priority=db_maint.priority,
        company_id=current_user.company_id,
        user_id=db_maint.tecnico_id,
        maintenance_id=db_maint.id,
        is_public=True
    )
    db.add(db_event)
    await db.commit()
    
    # 3. Trigger Notifications (In background)
    background_tasks.add_task(
        notification_service.create_notification,
        db, 
        db_maint.tecnico_id,
        "Nuevo Mantenimiento Programado",
        f"Se te ha asignado un mantenimiento ({maint_code}) para el {db_maint.scheduled_date.strftime('%d/%m/%Y %H:%M')}",
        notif_type="maintenance",
        url=f"/dashboard/calendar"
    )
    
    return {
        "status": "success", 
        "maint_code": maint_code,
        "maintenance_id": db_maint.id, 
        "event_id": db_event.id
    }
