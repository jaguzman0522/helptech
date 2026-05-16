from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "HelpDesk TI IA"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development" # "development" or "production"
    DEBUG: bool = True
    
    # DB Config
    DB_PASSWORD: str
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str = "hX8vP2qZ5wN9mK4L1rT7yB3nJ6vC8xM0pS9dU4fG1hA"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI (Gemini)
    GEMINI_API_KEY: Optional[str] = None
    
    # Notifications (Pusher)
    PUSHER_APP_ID: Optional[str] = None
    PUSHER_KEY: Optional[str] = None
    PUSHER_SECRET: Optional[str] = None
    PUSHER_CLUSTER: Optional[str] = "us2"
    
    # Email (Brevo)
    BREVO_API_KEY: Optional[str] = None
    EMAIL_FROM: str = "aguzman0522@gmail.com"
    EMAIL_NAME: str = "HelpDesk Support"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
