import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.database import Base
from app.models.user import User, Company
from app.models.inventory import Product, WarrantyTemplate, PurchaseOrder, PurchaseOrderItem, Warehouse, Assignment
from app.models.ticket import Ticket, Department, Category
from app.models.webhook_log import WebhookLog
from passlib.context import CryptContext

# Configuración de Seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def sync_and_reset():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    print("🔄 Sincronizando estructura de base de datos...")
    async with engine.begin() as conn:
        # Esto creará las tablas nuevas (como warranty_templates y webhook_logs)
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        print("🔑 Reseteando acceso para aguzman0522@gmail.com...")
        
        # 1. Asegurar que la empresa existe
        res_company = await session.execute(select(Company).where(Company.id == 1))
        company = res_company.scalar_one_or_none()
        if not company:
            company = Company(id=1, name="HelpDesk TI Master")
            session.add(company)
            await session.commit()

        # 2. Buscar o Crear Usuario
        result = await session.execute(select(User).where(User.email == "aguzman0522@gmail.com"))
        user = result.scalar_one_or_none()
        
        # Contraseña Maestra Temporal: "admin123" (puedes cambiarla luego en el perfil)
        new_hashed_password = pwd_context.hash("admin123")
        
        if user:
            user.hashed_password = new_hashed_password
            user.role = "superadmin"
            user.is_active = True
            user.company_id = 1
            print("✅ Usuario existente actualizado con contraseña: admin123")
        else:
            user = User(
                email="aguzman0522@gmail.com",
                hashed_password=new_hashed_password,
                full_name="Alberto Guzman",
                role="superadmin",
                is_active=True,
                company_id=1
            )
            session.add(user)
            print("✨ Nuevo SuperAdmin creado con contraseña: admin123")
        
        await session.commit()
    
    print("🚀 Sincronización completada. Ya puedes iniciar sesión.")

if __name__ == "__main__":
    asyncio.run(sync_and_reset())
