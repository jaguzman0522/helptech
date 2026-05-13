from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.database import AsyncSessionLocal
from app.models.audit import AuditLog
import json

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We only log state-changing requests (POST, PUT, DELETE, PATCH)
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            # Clone request body or get details (simplified for now)
            # Note: Reading request.body() can be tricky in middleware
            pass

        response = await call_next(request)
        
        # After response, we could log if it was successful
        # (Implementing a full audit middleware requires careful handling of request streams)
        return response

def log_action(user_id: int, action: str, entity_name: str, entity_id: int, details: dict = None, ip: str = None):
    """
    Utility function to log an action to the AuditLog.
    Can be used within endpoints or background tasks.
    """
    async def _log():
        async with AsyncSessionLocal() as db:
            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                entity_name=entity_name,
                entity_id=entity_id,
                details=details,
                ip_address=ip
            )
            db.add(log_entry)
            await db.commit()
    return _log
