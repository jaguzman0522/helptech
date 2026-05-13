import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User, Company
from app.models.inventory import Product, WarrantyTemplate, PurchaseOrder, PurchaseOrderItem, Warehouse, Assignment
from app.models.ticket import Ticket, Department, Category, ChatMessage
from app.models.webhook_log import WebhookLog

DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def sync():
    engine = create_async_engine(DATABASE_URL)
    
    print("📂 Asegurando directorios de evidencias...")
    os.makedirs("uploads/evidencias", exist_ok=True)
    
    print("🔄 Sincronizando modelos con la base de datos...")
    async with engine.begin() as conn:
        # Esto aplicará cualquier cambio en las tablas (añadir columnas como photo_before, public_token, etc.)
        await conn.run_sync(Base.metadata.create_all)
    
    print("🚀 Base de datos y directorios sincronizados exitosamente.")

if __name__ == "__main__":
    asyncio.run(sync())
