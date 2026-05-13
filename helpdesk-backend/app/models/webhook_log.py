from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(Integer, primary_key=True, index=True)
    external_app_id = Column(Integer, ForeignKey("external_apps.id"))
    event = Column(String(50)) # ticket.updated, ticket.created
    url = Column(String(500))
    payload = Column(JSON)
    response_status = Column(Integer)
    response_body = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    external_app = relationship("ExternalApp")
