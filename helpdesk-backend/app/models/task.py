from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class AutomatedTask(Base):
    __tablename__ = "automated_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False) # True = Solo SuperAdmin
    
    # Configuración de ejecución detallada
    schedule_type = Column(String(50), default="daily") # daily, weekly, monthly
    day_of_week = Column(String(50), nullable=True)     # Monday, Tuesday...
    day_of_month = Column(Integer, nullable=True)       # 1-31
    scheduled_time = Column(String(50), default="00:00") # HH:mm
    
    last_run = Column(DateTime(timezone=True), nullable=True)
    
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
