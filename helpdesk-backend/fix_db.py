import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def fix_database():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Sincronizando esquema de base de datos...")
        
        # 1. Crear tabla de Roles
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description VARCHAR(255),
                permissions JSONB DEFAULT '{}',
                is_system BOOLEAN DEFAULT FALSE,
                company_id INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))

        # 2. Crear tabla de Secuencias
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sequences (
                entity VARCHAR(50) PRIMARY KEY,
                last_number INTEGER DEFAULT 0
            );
        """))

        # 3. Añadir columnas a Companies
        columns_to_add_company = [
            ("logo_url", "VARCHAR(500)"),
            ("address", "VARCHAR(500)"),
            ("phone", "VARCHAR(50)")
        ]
        
        for col_name, col_type in columns_to_add_company:
            try:
                await conn.execute(text(f"ALTER TABLE companies ADD COLUMN {col_name} {col_type};"))
                print(f"Columna {col_name} añadida a companies.")
            except Exception:
                print(f"Columna {col_name} ya existe en companies.")

        # 4. Añadir columnas a Users
        columns_to_add_user = [
            ("user_code", "VARCHAR(50)"),
            ("role_id", "INTEGER"),
            ("role_name", "VARCHAR(50)")
        ]
        
        for col_name, col_type in columns_to_add_user:
            try:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                print(f"Columna {col_name} añadida a users.")
            except Exception:
                print(f"Columna {col_name} ya existe en users.")

        # 5. Añadir columna a Maintenances
        try:
            await conn.execute(text("ALTER TABLE maintenances ADD COLUMN maint_code VARCHAR(50) UNIQUE;"))
            print("Columna maint_code añadida a maintenances.")
        except Exception:
            print("Columna maint_code ya existe en maintenances.")

        print("Base de datos sincronizada con éxito.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_database())
