import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User
from app.core.security import get_password_hash

DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def update_admin():
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "aguzman0522@gmail.com"))
        user = result.scalar_one_or_none()
        if user:
            print(f"Actualizando contraseña para {user.email} con nuevo algoritmo PBKDF2...")
            user.hashed_password = get_password_hash("Guzm@n0522")
            await db.commit()
            print("Contraseña actualizada.")
        else:
            print("Usuario no encontrado.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(update_admin())
