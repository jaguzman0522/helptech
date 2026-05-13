from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float = 0.0
    stock: int = 0
    min_stock: int = 5

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MaterialAssignment(BaseModel):
    product_id: int
    quantity: int = 1

class InventoryMovementBase(BaseModel):
    product_id: int
    quantity: int
    movement_type: str  # input, output, adjustment
    reason: Optional[str] = None
    ticket_id: Optional[int] = None

class InventoryMovementOut(InventoryMovementBase):
    id: int
    code: str
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
