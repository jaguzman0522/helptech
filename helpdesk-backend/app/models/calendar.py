from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Event(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    
    type = Column(String(50), default="OTRO") # MANTENIMIENTO, REUNION, CAPACITACION, OTRO
    priority = Column(String(20), default="MEDIA") # BAJA, MEDIA, ALTA
    
    # Relationships
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Specific user if applicable
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Link to other entities
    maintenance_id = Column(Integer, ForeignKey("maintenances.id"), nullable=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    
    is_public = Column(Boolean, default=True) # Visible to all in company or just assigned
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
