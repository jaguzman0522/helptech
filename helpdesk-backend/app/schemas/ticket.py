from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    OPEN = "ABIERTO"
    ON_WAY = "EN_CAMINO"
    IN_PROGRESS = "EN_PROGRESO"
    RESOLVED = "RESUELTO"
    CLOSED = "CERRADO"

class TicketPriority(str, Enum):
    LOW = "BAJA"
    MEDIUM = "MEDIA"
    HIGH = "ALTA"
    CRITICAL = "CRITICA"

class DepartmentOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class CategoryOut(BaseModel):
    id: int
    name: str
    department_id: int
    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    title: str
    description: str
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    department_id: Optional[int] = None
    category_id: Optional[int] = None
    asset_id: Optional[int] = None
    photo_before: Optional[str] = None
    photo_after: Optional[str] = None
    external_source: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    technician_id: Optional[int] = None
    department_id: Optional[int] = None
    category_id: Optional[int] = None
    photo_after: Optional[str] = None

class TicketOut(TicketBase):
    id: int
    code: str
    status: TicketStatus
    requester_name: Optional[str] = None
    requester_dept: Optional[str] = None
    technician_id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
