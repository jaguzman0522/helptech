import asyncio
from sqlalchemy import text
from app.core.database import engine, Base
import app.models.inventory
import app.models.user
import app.models.ticket

async def check():
    async with engine.begin() as conn:
        # Create all tables if missing
        await conn.run_sync(Base.metadata.create_all)
        print("Database schema verified/created.")
        
        # Check if products table has rows
        result = await conn.execute(text("SELECT count(*) FROM products;"))
        count = result.scalar()
        print(f"Products in DB: {count}")

if __name__ == "__main__":
    asyncio.run(check())
