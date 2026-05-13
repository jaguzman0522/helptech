import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User, Company, Role
from app.models.ticket import Department, Category
from app.core.security import get_password_hash

DATABASE_URL = "postgresql+asyncpg://helpdesk:helpdesk_secret@db:5432/helpdesk"

async def seed_superadmin():
    engine = create_async_engine(DATABASE_URL, echo=True)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        # 1. Create Company
        result = await db.execute(select(Company).where(Company.name == "Guzman Tech"))
        company = result.scalar_one_or_none()
        if not company:
            company = Company(name="Guzman Tech")
            db.add(company)
            await db.flush()

        # 2. Create System Roles
        roles_data = [
            {"name": "Admin", "permissions": {"all": ["all"]}, "is_system": True},
            {"name": "Technician", "permissions": {"tickets": ["ver", "editar", "responder"]}, "is_system": True},
            {"name": "User", "permissions": {"tickets": ["crear", "ver"]}, "is_system": True},
        ]
        
        roles_objs = {}
        for r_data in roles_data:
            res = await db.execute(select(Role).where(Role.name == r_data["name"]))
            role = res.scalar_one_or_none()
            if not role:
                role = Role(**r_data)
                db.add(role)
                await db.flush()
            roles_objs[r_data["name"]] = role

        # 3. Create Departments
        depts_data = ["Soporte TI", "Mantenimiento", "Servicios Generales"]
        depts_objs = {}
        for d_name in depts_data:
            res = await db.execute(select(Department).where(Department.name == d_name, Department.company_id == company.id))
            d = res.scalar_one_or_none()
            if not d:
                d = Department(name=d_name, company_id=company.id)
                db.add(d)
                await db.flush()
            depts_objs[d_name] = d

        # 4. Create SuperAdmin
        result = await db.execute(select(User).where(User.email == "aguzman0522@gmail.com"))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                email="aguzman0522@gmail.com",
                hashed_password=get_password_hash("Guzm@n0522"),
                full_name="Alberto Guzman",
                role_name="Admin",
                role_id=roles_objs["Admin"].id,
                is_active=True,
                company_id=company.id,
                department_id=depts_objs["Soporte TI"].id,
                user_code="USR-0001"
            )
            db.add(user)
        else:
            # Actualizar si ya existe
            user.role_id = roles_objs["Admin"].id
            user.user_code = "USR-0001"

        await db.commit()
        print("SuperAdmin, Roles y Estructura base creados/actualizados con éxito.")

if __name__ == "__main__":
    asyncio.run(seed_superadmin())
