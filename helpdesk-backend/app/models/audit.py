from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # create_ticket, login, etc.
    entity_name = Column(String(50))  # ticket, user
    entity_id = Column(Integer)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
