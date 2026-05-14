from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SupportRoundBase(BaseModel):
    area: str
    responsible_name: str
    technician_name: str
    has_incident: bool = False
    incident_description: Optional[str] = None
    action_taken: Optional[str] = None
    visit_time: datetime

class SupportRoundCreate(SupportRoundBase):
    pass

class SupportRoundOut(SupportRoundBase):
    id: int
    company_id: int
    created_at: datetime

    class Config:
        from_attributes = True
