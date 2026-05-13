from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import security
from app.core.database import get_db
from app.models.user import User, Company
from app.schemas.user import UserCreate, UserOut, CompanyCreate, CompanyOut
from app.api import deps
from app.utils.sequence import get_next_sequence

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    # Generate Sequential Code
    user_code = await get_next_sequence(db, "user", "USR")

    # Create user
    db_user = User(
        user_code=user_code,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role_name=user_in.role, # Keep for legacy/UI display
        role_id=user_in.role_id if hasattr(user_in, 'role_id') else None,
        company_id=user_in.company_id or current_user.company_id if 'current_user' in locals() else user_in.company_id,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserOut)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
):
    return current_user

@router.post("/companies", response_model=CompanyOut)
async def create_company(
    company_in: CompanyCreate,
    db: AsyncSession = Depends(get_db)
):
    db_company = Company(name=company_in.name, tax_id=company_in.tax_id)
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)
    return db_company
