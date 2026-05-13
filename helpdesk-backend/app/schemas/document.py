from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class MaterialItem(BaseModel):
    product_code: str
    name: str
    quantity: int

class TicketClosureSchema(BaseModel):
    document_type: str = "ticket_closure"
    ticket_code: str
    created_at: datetime
    client_name: str
    technician: str
    problem_summary: str
    resolution: str
    materials_used: List[MaterialItem] = []
    digital_signature_url: Optional[str] = None
    total_cost: float = 0.0

class TechnicianEfficiency(BaseModel):
    name: str
    closed_tickets: int
    avg_rating: float

class InventoryConsumption(BaseModel):
    category: str
    units: int
    cost: float

class KPIReportSchema(BaseModel):
    report_month: str  # YYYY-MM
    total_tickets: int
    avg_resolution_hours: float
    top_categories: List[str]
    technician_efficiency: List[TechnicianEfficiency]
    inventory_consumption: List[InventoryConsumption]

class InventoryMovementSchema(BaseModel):
    movement_code: str
    ticket_code: Optional[str] = None
    product_code: str
    quantity: int
    movement_type: str  # input, output
    authorized_by: str
    timestamp: datetime
    observations: Optional[str] = None
