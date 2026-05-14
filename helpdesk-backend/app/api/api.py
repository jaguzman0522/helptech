from fastapi import APIRouter
from app.api.endpoints import auth, users, tickets, websockets, inventory, profile, calendar, maintenance, reports, settings, superadmin, external, assignments, public, roles, api_keys, rounds

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(superadmin.router, prefix="/superadmin", tags=["superadmin"])
api_router.include_router(external.router, prefix="/external", tags=["external"])
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(assignments.router, prefix="/inventory/assignments", tags=["assignments"])
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])
api_router.include_router(rounds.router, prefix="/rounds", tags=["rounds"])
