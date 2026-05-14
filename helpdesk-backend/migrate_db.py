import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    print("🚀 Iniciando migración manual de base de datos...")
    async with engine.begin() as conn:
        try:
            # Crear tabla de rondas
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS support_rounds (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER REFERENCES companies(id),
                    area VARCHAR(200) NOT NULL,
                    responsible_name VARCHAR(200) NOT NULL,
                    technician_name VARCHAR(200) NOT NULL,
                    has_incident BOOLEAN DEFAULT FALSE,
                    incident_description TEXT,
                    action_taken TEXT,
                    visit_time TIMESTAMP NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """))
            print("✅ Tabla support_rounds verificada/creada.")
            
            # Columnas adicionales para companies
            try: await conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);"))
            except: pass
            try: await conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);"))
            except: pass
            
            print("✅ Estructura de companies verificada.")
            
        except Exception as e:
            print(f"❌ Error durante la migración: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
