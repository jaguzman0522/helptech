from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Dictionary to store connections: {user_id: websocket}
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast(self, message: dict, company_id: int = None, db_session = None):
        """
        In a real scenario, you might want to broadcast only to users of the same company.
        For now, this is a simple broadcast to all connected users.
        """
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception:
                # Handle disconnected clients that didn't call disconnect
                pass

manager = ConnectionManager()
