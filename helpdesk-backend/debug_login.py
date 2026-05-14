import asyncio
from sqlalchemy import select, or_
from app.core.database import AsyncSessionLocal
from app.models.user import User
import traceback

async def debug_user():
    print("🧪 Probando consulta de usuario...")
    async with AsyncSessionLocal() as db:
        try:
            email_to_find = "aguzman0522@gmail.com"
            print(f"🔍 Buscando: {email_to_find}")
            
            # Esta es la misma consulta que hace el login
            stmt = select(User).where(
                or_(User.email == email_to_find, User.username == "aguzman")
            )
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user:
                print(f"✅ Usuario encontrado: {user.email}")
                
                # Probar Verificación de Password
                from app.core import security
                print("🔐 Probando verificación de contraseña...")
                is_valid = security.verify_password("Guzm@n0522", user.hashed_password)
                print(f"✅ Resultado verificación: {is_valid}")
                
                # Probar Generación de Token
                print("🎫 Probando generación de JWT...")
                token = security.create_access_token(user.id)
                print(f"✅ Token generado con éxito: {token[:15]}...")
            else:
                print("❌ Usuario no encontrado en la base de datos.")
                
        except Exception as e:
            print("🛑 CRASH DETECTADO:")
            print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(debug_user())
