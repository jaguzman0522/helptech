from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.calendar import Event
from app.models.user import User
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_events(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Visibility logic: Admins see all. Technicians and Users see public or assigned to them/their dept.
    query = select(Event).where(Event.company_id == current_user.company_id)
    
    if current_user.role != "superadmin":
        query = query.where(
            or_(
                Event.is_public == True,
                Event.user_id == current_user.id,
                Event.department_id == current_user.department_id
            )
        )
        
    result = await db.execute(query.order_by(Event.start_time.asc()))
    return result.scalars().all()

@router.post("/", response_model=dict)
async def create_event(
    event_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    db_event = Event(
        title=event_in.get("title"),
        description=event_in.get("description"),
        start_time=datetime.fromisoformat(event_in.get("start_time")),
        type=event_in.get("type", "OTRO"),
        priority=event_in.get("priority", "MEDIA"),
        company_id=current_user.company_id,
        user_id=event_in.get("user_id") or current_user.id,
        department_id=event_in.get("department_id"),
        is_public=event_in.get("is_public", True)
    )
    
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event
