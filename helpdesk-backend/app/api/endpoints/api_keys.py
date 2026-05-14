from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
import secrets
import hashlib
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import APIKey, User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class APIKeyCreate(BaseModel):
    name: str

class APIKeyOut(BaseModel):
    id: int
    name: str
    client_id: str
    created_at: datetime
    last_used: datetime = None

class APIKeyGenerated(APIKeyOut):
    api_key: str # Solo se devuelve al crear

@router.post("/", response_model=APIKeyGenerated)
async def create_api_key(
    key_in: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generar Client ID y API Key
    client_id = f"CLI-{secrets.token_hex(4).upper()}"
    raw_key = f"sk_live_{secrets.token_urlsafe(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()

    db_key = APIKey(
        name=key_in.name,
        client_id=client_id,
        hashed_key=hashed_key,
        company_id=current_user.company_id
    )
    
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    return {
        "id": db_key.id,
        "name": db_key.name,
        "client_id": db_key.client_id,
        "api_key": raw_key,
        "created_at": db_key.created_at
    }

@router.get("/", response_model=List[APIKeyOut])
async def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(APIKey).filter(APIKey.company_id == current_user.company_id, APIKey.is_active == True).all()

@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.company_id == current_user.company_id).first()
    if not db_key:
        raise HTTPException(status_code=404, detail="Llave no encontrada")
    
    db_key.is_active = False
    db.commit()
    return {"message": "Llave revocada"}
