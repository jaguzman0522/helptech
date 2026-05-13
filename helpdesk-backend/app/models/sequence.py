from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Sequence(Base):
    __tablename__ = "sequences"
    
    entity = Column(String(50), primary_key=True)  # 'ticket', 'product', 'movement'
    last_number = Column(Integer, default=0)
