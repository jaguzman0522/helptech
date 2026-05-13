import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.inventory import Product
import uuid

DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def generate_test_tokens():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("🎫 Generando Public Tokens para activos existentes...")
        result = await session.execute(select(Product))
        products = result.scalars().all()
        
        for product in products:
            if not product.public_token:
                product.public_token = str(uuid.uuid4())
                print(f"✅ Token generado para {product.code}: {product.public_token}")
        
        await session.commit()
    print("🚀 Tokens listos. Ya puedes probar el Portal Público.")

if __name__ == "__main__":
    asyncio.run(generate_test_tokens())
