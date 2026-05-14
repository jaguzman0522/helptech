from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AutomatedTaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    schedule_type: str = "daily"
    day_of_week: Optional[str] = None
    day_of_month: Optional[int] = None
    scheduled_time: str = "00:00"

class AutomatedTaskCreate(AutomatedTaskBase):
    pass

class AutomatedTaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    frequency: Optional[str] = None

class AutomatedTaskOut(AutomatedTaskBase):
    id: int
    is_system: bool
    last_run: Optional[datetime] = None
    
    class Config:
        from_attributes = True
