from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core import security
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import Token
from pydantic import BaseModel, Field

router = APIRouter()

class LoginRequest(BaseModel):
    username: str = Field(..., description="Email or Username")
    password: str = Field(..., description="User password")

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
