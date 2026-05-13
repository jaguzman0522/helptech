import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User

DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def list_users():
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        print("\n=== USUARIOS EN EL SISTEMA ===")
        for u in users:
            print(f"Email: {u.email} | Nombre: {u.full_name} | Rol: {u.role}")
        print("==============================\n")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(list_users())
