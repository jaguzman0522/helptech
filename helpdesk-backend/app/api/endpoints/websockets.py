from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.websocket_manager import manager
from app.core import security
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str = None):
    # Basic token validation could be added here
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            # You can handle incoming messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(user_id)
