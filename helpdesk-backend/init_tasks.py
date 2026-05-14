import asyncio
from sqlalchemy import text
from app.core.database import engine, Base
# Import all models to ensure they are registered with Base
import app.models.task
import app.models.user
import app.models.ticket

async def init_tasks():
    # Create table if not exists
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables synchronized.")

    # Seed system tasks for the main company
    from app.core.database import AsyncSessionLocal
    from app.models.task import AutomatedTask
    from sqlalchemy import select
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(AutomatedTask).where(AutomatedTask.is_system == True))
        if not result.scalars().first():
            tasks = [
                AutomatedTask(name="Auto-Cierre de Tickets", description="Resueltos sin actividad por 5 días", is_system=True, company_id=1),
                AutomatedTask(name="Analista de Mantenimiento", description="Predice fallas vía IA Gemini", is_system=True, company_id=1),
                AutomatedTask(name="Check de Stock Mínimo", description="Alerta automática de compras", is_system=True, company_id=1),
                AutomatedTask(name="Resumen Semanal de IA", description="Reporte de desempeño del equipo", is_system=True, company_id=1),
                AutomatedTask(name="Purga de Evidencias", description="Limpieza de archivos de más de 6 meses", is_system=True, company_id=1),
            ]
            db.add_all(tasks)
            await db.commit()
            print("System tasks seeded successfully.")
        else:
            print("System tasks already exist.")

if __name__ == "__main__":
    asyncio.run(init_tasks())
