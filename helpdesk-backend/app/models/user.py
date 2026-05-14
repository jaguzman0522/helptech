from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, default={}) # Estructura: {"modulo": ["ver", "crear", ...]}
    is_system = Column(Boolean, default=False) # Roles protegidos (Admin, Tech, User)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_code = Column(String(50), unique=True, index=True) # USR-0001
    username = Column(String(100), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role_name = Column(String(50), default="user") # Fallback legacy
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    signature_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("Role")
    company = relationship("Company")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    tax_id = Column(String(50), unique=True, nullable=True)
    logo_url = Column(String(500), nullable=True)
    address = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    prefix = Column(String(10), default="RND") # Prefijo para rondas/documentos
    is_active = Column(Boolean, default=True)
    
    # IA & Automation Settings
    auto_close_tickets = Column(Boolean, default=True)
    ai_maintenance_analyst = Column(Boolean, default=True)
    stock_check_alert = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # Nombre de la integración (ej: CRM, Slack)
    client_id = Column(String(100), unique=True, index=True, nullable=False)
    hashed_key = Column(String(255), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company")
