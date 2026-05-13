from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ProductType(str, enum.Enum):
    REPUESTO = "REPUESTO"
    ACTIVO_FIJO = "ACTIVO_FIJO"
    ELECTRONICO = "ELECTRONICO"
    TELEFONO = "TELEFONO"
    ROPA = "ROPA"
    ALIMENTO = "ALIMENTO"
    SERVICIO = "SERVICIO"

class MovementType(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"

class WarrantyTemplate(Base):
    __tablename__ = "warranty_templates"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String(100), nullable=False)
    months = Column(Integer, default=12)
    terms = Column(Text, nullable=True)
    return_policy = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    warranty_template_id = Column(Integer, ForeignKey("warranty_templates.id"), nullable=True)
    
    code = Column(String(50), unique=True, index=True)
    barcode = Column(String(100), index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(String(50)) # ACTIVO, SUMINISTRO
    
    serial_number = Column(String(100), unique=True)
    brand = Column(String(100))
    model = Column(String(100))
    
    purchase_date = Column(Date)
    warranty_end_date = Column(Date)
    
    status = Column(String(50), default="STOCK") # STOCK, ASIGNADO, MANTENIMIENTO, BAJA, ROBADO
    public_token = Column(String(36), unique=True, index=True) # UUID para acceso público
    
    stock_total = Column(Float, default=0.0)
    stock_min = Column(Float, default=1.0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    warranty_template = relationship("WarrantyTemplate")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    
    # Dynamic specs as JSON
    specs = Column(JSON, nullable=True) # marca, modelo, imei, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True) # MOV-XXXXXX
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    type = Column(String(20), nullable=False) # ENTRADA, SALIDA
    quantity = Column(Float, nullable=False)
    reason = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    tax_id = Column(String(50), nullable=True)
    contact_name = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    provider_id = Column(Integer, ForeignKey("providers.id"))
    
    code = Column(String(50), unique=True)
    status = Column(String(50), default="PENDIENTE") # PENDIENTE, APROBADO, RECHAZADO, RECIBIDO
    total = Column(Float, default=0.0)
    
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    provider = relationship("Provider")
    items = relationship("PurchaseOrderItem", backref="order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    condition_on_delivery = Column(String(100), default="Excelente")
    notes = Column(Text, nullable=True)
    
    # Datos del Acta
    act_code = Column(String(50), unique=True) # ACT-XXXXXX
    digital_signature_url = Column(String(500))
    stamp_hash = Column(String(64)) # SHA-256 validation
    
    is_active = Column(Boolean, default=True)
    assigned_at = Column(DateTime, default=func.now())
    returned_at = Column(DateTime, nullable=True)

    product = relationship("Product")
    user = relationship("User")
