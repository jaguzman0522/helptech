from app.core.database import Base
from app.models.user import User, Company
from app.models.ticket import Ticket, Department, Category, ChatMessage
from app.models.sequence import Sequence
from app.models.audit import AuditLog
from app.models.inventory import Product, InventoryMovement, Warehouse, Provider, PurchaseOrder, PurchaseOrderItem
from app.models.maintenance import Maintenance
from app.models.calendar import Event
from app.models.external_app import ExternalApp
from app.models.notification import Notification
