import asyncio
from sqlalchemy import text
from app.core.database import engine

async def fix():
    async with engine.begin() as conn:
        print("Añadiendo columnas faltantes a 'products'...")
        try:
            await conn.execute(text("ALTER TABLE products ADD COLUMN brand VARCHAR(100);"))
            print("Columna 'brand' añadida.")
        except Exception as e:
            print(f"Brand ya existe o error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE products ADD COLUMN model VARCHAR(100);"))
            print("Columna 'model' añadida.")
        except Exception as e:
            print(f"Model ya existe o error: {e}")

        try:
            await conn.execute(text("ALTER TABLE products ADD COLUMN specs JSON;"))
            print("Columna 'specs' añadida.")
        except Exception as e:
            print(f"Specs ya existe o error: {e}")

if __name__ == "__main__":
    asyncio.run(fix())
