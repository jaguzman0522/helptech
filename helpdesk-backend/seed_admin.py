import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, Company
from app.core.security import get_password_hash

async def seed_superadmin():
    async with AsyncSessionLocal() as db:
        # 1. Create or Update Company
        result = await db.execute(select(Company).where(Company.id == 1))
        company = result.scalar_one_or_none()
        
        if not company:
            company = Company(id=1, name="Guzman Tech", tax_id="GT-001")
            db.add(company)
        else:
            company.name = "Guzman Tech"
            
        await db.commit()
        await db.refresh(company)
        
        # 2. Create or Update SuperAdmin User
        email = "aguzman0522@gmail.com" 
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=email,
                full_name="Alberto Guzman",
                hashed_password=get_password_hash("Guzm@n0522"),
                role="admin",  # Use 'admin' as base role for now
                company_id=1,
                is_active=True
            )
            db.add(user)
        else:
            user.hashed_password = get_password_hash("Guzm@n0522")
            user.full_name = "Alberto Guzman"
            
        await db.commit()
        print(f"SuperAdmin creado con éxito:")
        print(f"Usuario: {email}")
        print(f"Password: Guzm@n0522")
        print(f"Empresa: Guzman Tech")

if __name__ == "__main__":
    asyncio.run(seed_superadmin())
