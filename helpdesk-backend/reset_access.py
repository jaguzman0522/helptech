import asyncio
from sqlalchemy import text
from app.core.database import engine
from app.core.security import get_password_hash

async def total_reset():
    print("🚀 INICIANDO AUDITORÍA Y RESET DE EMERGENCIA...")
    async with engine.begin() as conn:
        try:
            # 1. Asegurar esquema básico
            print("📏 Verificando columnas...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS user_code VARCHAR(50) UNIQUE;"))
            
            # 2. Asegurar Empresa (Sin forzar ID si ya existe)
            print("🏢 Asegurando empresa...")
            await conn.execute(text("INSERT INTO companies (name) VALUES ('Guzman Tech') ON CONFLICT DO NOTHING;"))
            company_id = (await conn.execute(text("SELECT id FROM companies LIMIT 1;"))).scalar()

            # 3. Asegurar Roles
            print("🔑 Asegurando roles de sistema...")
            await conn.execute(text("INSERT INTO roles (name, is_system) VALUES ('SuperAdmin', true) ON CONFLICT DO NOTHING;"))
            role_id = (await conn.execute(text("SELECT id FROM roles WHERE name='SuperAdmin' LIMIT 1;"))).scalar()

            # 4. RESET TOTAL DEL USUARIO MAESTRO
            print("👤 Re-instalando usuario administrador...")
            email = "aguzman0522@gmail.com"
            username = "aguzman"
            password = "Guzm@n0522"
            hashed_pw = get_password_hash(password)
            
            # Borramos si existe para evitar conflictos y asegurar datos limpios
            await conn.execute(text(f"DELETE FROM users WHERE email = '{email}';"))
            
            await conn.execute(text(f"""
                INSERT INTO users (user_code, username, email, hashed_password, full_name, role_name, role_id, company_id, is_active)
                VALUES ('USR-0001', '{username}', '{email}', '{hashed_pw}', 'Alberto Guzman', 'admin', {role_id}, {company_id}, true);
            """))
            
            print(f"\n✅ AUDITORÍA COMPLETADA CON ÉXITO")
            print(f"-----------------------------------")
            print(f"USUARIO: {username} (o {email})")
            print(f"CLAVE:   {password}")
            print(f"-----------------------------------")
            print("Ya puedes intentar el login.")

        except Exception as e:
            print(f"❌ ERROR CRÍTICO EN AUDITORÍA: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(total_reset())
