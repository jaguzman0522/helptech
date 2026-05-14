import asyncio
from sqlalchemy import text
from app.core.database import engine

async def fix_cols():
    async with engine.begin() as conn:
        try:
            result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='automated_tasks';"))
            existing_cols = [row[0] for row in result.fetchall()]
            
            if "schedule_type" not in existing_cols:
                await conn.execute(text("ALTER TABLE automated_tasks ADD COLUMN schedule_type VARCHAR(50) DEFAULT 'daily';"))
            if "day_of_week" not in existing_cols:
                await conn.execute(text("ALTER TABLE automated_tasks ADD COLUMN day_of_week VARCHAR(50);"))
            if "day_of_month" not in existing_cols:
                await conn.execute(text("ALTER TABLE automated_tasks ADD COLUMN day_of_month INTEGER;"))
            if "scheduled_time" not in existing_cols:
                await conn.execute(text("ALTER TABLE automated_tasks ADD COLUMN scheduled_time VARCHAR(50) DEFAULT '00:00';"))
            
            # Remove old frequency if exists
            if "frequency" in existing_cols:
                await conn.execute(text("ALTER TABLE automated_tasks DROP COLUMN frequency;"))
                
            print("Successfully updated automated_tasks table schema.")
        except Exception as e:
            print(f"Error fixing task columns: {e}")

if __name__ == "__main__":
    asyncio.run(fix_cols())
