from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core import security
from app.core.database import get_db
from app.models.user import User, Company, Role
from app.models.ticket import Department, Category
from app.utils.sequence import get_next_sequence
from app.schemas.auth import Token
from pydantic import BaseModel, Field
import random
from datetime import datetime, timedelta

router = APIRouter()

class LoginRequest(BaseModel):
    username: str = Field(..., description="Email or Username")
    password: str = Field(..., description="User password")

class CompanyRegister(BaseModel):
    name: str
    slug: str
    admin_email: str
    admin_name: str
    password: str
    plan_id: Optional[str] = "free"
    phone: Optional[str] = None

from typing import Optional

from fastapi import Request

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    username = None
    password = None

    # Intentar detectar el tipo de contenido
    content_type = request.headers.get("content-type", "")
    
    if "application/json" in content_type:
        try:
            data = await request.json()
            username = data.get("username")
            password = data.get("password")
        except:
            pass
    
    # Si no se encontró en JSON, intentar en Formulario
    if not username or not password:
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except:
            pass

    if not username or not password:
        print(f"❌ ERROR: Credenciales no encontradas en el cuerpo (Content-Type: {content_type})")
        raise HTTPException(
            status_code=422, 
            detail="Se requieren 'username' y 'password'"
        )

    print(f"DEBUG: Intento de login detectado para '{username}'")
    
    try:
        query = select(User).where(
            or_(User.email == username, User.username == username)
        )
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            print(f"DEBUG: Usuario '{username}' no encontrado")
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")

        if not security.verify_password(password, user.hashed_password):
            print(f"DEBUG: Contraseña incorrecta para '{username}'")
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")

        token = security.create_access_token(user.id)
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno")

@router.post("/register-company")
async def register_company(
    data: CompanyRegister,
    db: AsyncSession = Depends(get_db)
):
    # 1. Validar disponibilidad
    q = select(Company).where(or_(Company.name == data.name, Company.slug == data.slug))
    res = await db.execute(q)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Company name or slug already in use")

    q = select(User).where(User.email == data.admin_email)
    res = await db.execute(q)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Admin email already registered")

    try:
        # 2. Create Company (EMP-XXXX)
        emp_code = await get_next_sequence(db, "company", "EMP")
        verification_token = "".join([str(random.randint(0, 9)) for _ in range(6)])
        
        new_company = Company(
            code=emp_code,
            name=data.name,
            slug=data.slug,
            plan_id=data.plan_id,
            phone=data.phone,
            verification_token=verification_token,
            trial_ends_at=datetime.now() + timedelta(days=30)
        )
        db.add(new_company)
        await db.flush() 

        # 3. Create Local Company Roles
        admin_role = Role(
            name="Admin",
            description="Company full control",
            permissions={"all": ["all"]},
            company_id=new_company.id,
            is_system=True
        )
        db.add(admin_role)

        tech_role = Role(
            name="Technician",
            description="Ticket and inventory management",
            permissions={
                "tickets": ["view", "edit", "reply", "close"],
                "inventory": ["view", "edit", "consume"]
            },
            company_id=new_company.id,
            is_system=True
        )
        db.add(tech_role)

        user_role = Role(
            name="User",
            description="Service requester",
            permissions={
                "tickets": ["create", "view"]
            },
            company_id=new_company.id,
            is_system=True
        )
        db.add(user_role)
        
        await db.flush()

        # 4. Create Initial IT Department
        new_dept = Department(
            name="IT",
            company_id=new_company.id
        )
        db.add(new_dept)
        await db.flush()

        # 5. Create Initial Category
        new_cat = Category(
            name="General Support",
            department_id=new_dept.id,
            company_id=new_company.id
        )
        db.add(new_cat)
        await db.flush()

        # 6. Crear Usuario Administrador (USR-XXXX)
        usr_code = await get_next_sequence(db, "user", "USR")
        new_user = User(
            user_code=usr_code,
            email=data.admin_email,
            username=data.admin_email.split('@')[0],
            full_name=data.admin_name,
            hashed_password=security.get_password_hash(data.password),
            role_id=admin_role.id,
            company_id=new_company.id,
            department_id=new_dept.id
        )
        db.add(new_user)
        
        await db.commit()
        
        # 7. Enviar Email de Verificación (Brevo o Consola en Desarrollo)
        from app.services.notifications import notification_helper
        from app.core.config import settings

        subject = f"Verifica tu cuenta - {settings.PROJECT_NAME}"
        html = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #1e293b;">Bienvenido a {settings.PROJECT_NAME}</h2>
                <p>Hola <strong>{data.admin_name}</strong>,</p>
                <p>Gracias por registrar a <strong>{data.name}</strong> en nuestra plataforma. Para completar tu registro, utiliza el siguiente código de verificación:</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <h1 style="color: #2563eb; font-size: 40px; letter-spacing: 10px; margin: 0;">{verification_token}</h1>
                </div>
                <p style="color: #64748b; font-size: 14px;">Este código es privado y obligatorio para activar tu instancia multi-tenant.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8;">© 2026 {settings.PROJECT_NAME} Support Team</p>
            </div>
        """
        
        await notification_helper.send_email(data.admin_email, subject, html)

        return {
            "status": "success",
            "message": "Company registered successfully. Check your email for the verification code.",
            "company_id": new_company.id
        }

    except Exception as e:
        await db.rollback()
        print(f"❌ REGISTER ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering company: {str(e)}")
