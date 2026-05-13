from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class RoleOut(BaseModel):
    id: int
    name: str
    permissions: dict
    is_system: bool

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "user"
    company_id: Optional[int] = None
    role_id: Optional[int] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: int
    user_code: Optional[str] = None
    is_active: bool
    created_at: datetime
    role: Optional[RoleOut] = None

    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    tax_id: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyOut(CompanyBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
