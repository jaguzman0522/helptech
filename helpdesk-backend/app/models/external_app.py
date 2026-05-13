from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ExternalApp(Base):
    __tablename__ = "external_apps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    client_id = Column(String, unique=True, index=True, nullable=False) # APP-XXXXXX
    api_key_hash = Column(String, nullable=False) # SHA-256
    prefix = Column(String, default="EXT") # Prefijo para sus tickets
    is_active = Column(Boolean, default=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
