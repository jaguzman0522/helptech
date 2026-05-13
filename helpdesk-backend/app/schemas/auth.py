from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    company_id: Optional[int] = None
    role: Optional[str] = None

class Login(BaseModel):
    username: str  # FastAPI OAuth2 uses 'username' even if it's an email
    password: str
