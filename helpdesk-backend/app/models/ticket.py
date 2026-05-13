from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TicketStatus(str, enum.Enum):
    OPEN = "ABIERTO"
    ON_WAY = "EN_CAMINO"
    IN_PROGRESS = "EN_PROGRESO"
    RESOLVED = "RESUELTO"
    CLOSED = "CERRADO"

class TicketPriority(str, enum.Enum):
    LOW = "BAJA"
    MEDIUM = "MEDIA"
    HIGH = "ALTA"
    CRITICAL = "CRITICA"

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    status = Column(String(50), default=TicketStatus.OPEN)
    priority = Column(String(50), default=TicketPriority.MEDIUM)
    
    # Relationships
    company_id = Column(Integer, ForeignKey("companies.id"))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    # Requester info (Auto-filled)
    requester_id = Column(Integer, ForeignKey("users.id"))
    requester_name = Column(String(255))
    requester_dept = Column(String(255))
    
    # Technician Assignment
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Asset link
    asset_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    
    # Evidence & Closure
    photo_before = Column(String(500), nullable=True)
    photo_after = Column(String(500), nullable=True)
    closing_signature = Column(String(500), nullable=True)
    
    # Geolocation
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    maps_url = Column(String(500), nullable=True)
    
    # Origen Externo (API)
    external_source = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
