from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class MaintenanceType(str, enum.Enum):
    PREVENTIVO = "PREVENTIVO"
    CORRECTIVO = "CORRECTIVO"
    PREDICTIVO = "PREDICTIVO"

class Maintenance(Base):
    __tablename__ = "maintenances"
    id = Column(Integer, primary_key=True, index=True)
    maint_code = Column(String(50), unique=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    tecnico_id = Column(Integer, ForeignKey("users.id"))
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    
    type = Column(String(50), default=MaintenanceType.PREVENTIVO)
    priority = Column(String(50), default="MEDIA")
    description = Column(Text, nullable=True)
    
    scheduled_date = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    status = Column(String(50), default="PROGRAMADO") # PROGRAMADO, EN_CURSO, COMPLETADO, CANCELADO
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
