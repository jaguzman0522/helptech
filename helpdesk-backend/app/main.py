from fastapi import FastAPI
from app.api.api import api_router
from app.core.config import settings

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi.responses import JSONResponse
import os
import traceback
import logging

# Asegurar que el directorio de evidencias exista
UPLOAD_DIR = "uploads/evidencias"
os.makedirs(UPLOAD_DIR, exist_ok=True)

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("SISTEMA: Iniciando aplicación HelpDesk...")

app = FastAPI(
    title="HelpDesk Tech API",
    description="API para gestión de tickets y mantenimiento",
    version="1.8.0",
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Set all origins enabled for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"GLOBAL ERROR: {str(exc)}")
    logging.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc), "traceback": traceback.format_exc()},
    )

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
