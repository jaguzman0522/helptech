from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class SupportRound(Base):
    __tablename__ = "support_rounds"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    area = Column(String(200), nullable=False)
    responsible_name = Column(String(200), nullable=False) # Persona que valida
    technician_name = Column(String(200), nullable=False) # Técnico que realiza
    
    has_incident = Column(Boolean, default=False)
    incident_description = Column(Text, nullable=True)
    action_taken = Column(Text, nullable=True)
    
    visit_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
