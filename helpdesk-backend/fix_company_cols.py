import asyncio
from sqlalchemy import text
from app.core.database import engine

async def fix_cols():
    async with engine.begin() as conn:
        try:
            # Check if columns exist first to avoid errors
            result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='companies';"))
            existing_cols = [row[0] for row in result.fetchall()]
            
            if "auto_close_tickets" not in existing_cols:
                await conn.execute(text("ALTER TABLE companies ADD COLUMN auto_close_tickets BOOLEAN DEFAULT TRUE;"))
            if "ai_maintenance_analyst" not in existing_cols:
                await conn.execute(text("ALTER TABLE companies ADD COLUMN ai_maintenance_analyst BOOLEAN DEFAULT TRUE;"))
            if "stock_check_alert" not in existing_cols:
                await conn.execute(text("ALTER TABLE companies ADD COLUMN stock_check_alert BOOLEAN DEFAULT FALSE;"))
            
            print("Successfully checked/added IA columns to companies table.")
        except Exception as e:
            print(f"Error fixing columns: {e}")

if __name__ == "__main__":
    asyncio.run(fix_cols())
