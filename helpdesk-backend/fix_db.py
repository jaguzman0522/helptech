import asyncio
from sqlalchemy import text
from app.core.database import engine

async def fix_database():
    print("🔍 Iniciando diagnóstico de base de datos...")
    async with engine.begin() as conn:
        try:
            # Verificar si existe la columna username
            result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='username'"))
            column_exists = result.fetchone()

            if not column_exists:
                print("⚠️  Falta la columna 'username'. Intentando crearla...")
                await conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;"))
                print("✅ Columna 'username' añadida con éxito.")
                
                # Opcional: Poblar usernames basados en el email para usuarios existentes
                print("🔄 Poblando nombres de usuario iniciales...")
                await conn.execute(text("UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;"))
                print("✅ Usuarios actualizados.")

            # Verificar si existe la tabla api_keys
            result = await conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys')"))
            table_exists = result.scalar()

            if not table_exists:
                print("⚠️  Falta la tabla 'api_keys'. Creándola...")
                await conn.execute(text("""
                    CREATE TABLE api_keys (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        client_id VARCHAR(100) UNIQUE NOT NULL,
                        hashed_key VARCHAR(255) NOT NULL,
                        company_id INTEGER REFERENCES companies(id) NOT NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        last_used TIMESTAMP WITH TIME ZONE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """))
                print("✅ Tabla 'api_keys' creada.")

            else:
                print("✅ La columna 'username' y la tabla 'api_keys' ya existen.")

            # --- ASEGURAR USUARIO ADMINISTRADOR ---
            from app.core.security import get_password_hash
            
            # 1. Asegurar Empresa ID 1
            print("🏢 Verificando empresa principal...")
            await conn.execute(text("INSERT INTO companies (id, name) VALUES (1, 'Guzman Tech') ON CONFLICT (id) DO NOTHING;"))
            
            # 2. Asegurar Roles de Sistema
            print("🔑 Verificando roles...")
            await conn.execute(text("INSERT INTO roles (id, name, is_system) VALUES (1, 'SuperAdmin', true) ON CONFLICT (id) DO NOTHING;"))

            # 3. Asegurar Usuario Admin con Username
            print("👤 Verificando usuario administrador...")
            hashed_pw = get_password_hash("Guzm@n0522")
            email = "aguzman0522@gmail.com"
            username = "aguzman"
            
            await conn.execute(text(f"""
                INSERT INTO users (user_code, username, email, hashed_password, full_name, role_name, role_id, company_id, is_active)
                VALUES ('USR-0001', '{username}', '{email}', '{hashed_pw}', 'Alberto Guzman', 'admin', 1, 1, true)
                ON CONFLICT (email) DO UPDATE SET 
                    username = EXCLUDED.username,
                    hashed_password = EXCLUDED.hashed_password,
                    role_id = EXCLUDED.role_id;
            """))
            print(f"✅ Administrador listo: {email} / {username}")
            print("🚀 Base de datos sincronizada correctamente.")

        except Exception as e:
            print(f"❌ Error durante la reparación: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_database())
