from fastapi import FastAPI
from app.api.api import api_router
from app.core.config import settings

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
import os
import traceback
import logging

# Asegurar que el directorio de evidencias exista
UPLOAD_DIR = "uploads/evidencias"
os.makedirs(UPLOAD_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("SISTEMA: Iniciando aplicación HelpDesk...")

app = FastAPI(
    title="HelpDesk Tech API",
    description="API para gestión de tickets y mantenimiento",
    version="1.8.0",
)

@app.on_event("startup")
async def startup_event():
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        try:
            # Sincronización de Tablas (SQL Directo)
            await session.execute(text("""
                CREATE TABLE IF NOT EXISTS support_rounds (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER REFERENCES companies(id),
                    area VARCHAR(200) NOT NULL,
                    responsible_name VARCHAR(200) NOT NULL,
                    technician_name VARCHAR(200) NOT NULL,
                    has_incident BOOLEAN DEFAULT FALSE,
                    incident_description TEXT,
                    action_taken TEXT,
                    visit_time TIMESTAMP NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """))
            
            # Migraciones incrementales
            try: await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);"))
            except: pass
            try: await session.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS model VARCHAR(100);"))
            except: pass
            try: await session.execute(text("ALTER TABLE automated_tasks ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(50);"))
            except: pass
            try: await session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);"))
            except: pass
            try: await session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);"))
            except: pass
            
            # 3. Migraciones incrementales (si es necesario)
            try:
                await session.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS prefix VARCHAR(10) DEFAULT 'RND';"))
                await session.commit()
                print("✅ SISTEMA: Migraciones incrementales completadas (prefix).")
            except Exception as e:
                print(f"⚠️ SISTEMA: Error en migración incremental: {e}")
                await session.rollback()
            
            await session.commit()
            print("✅ SISTEMA: Estructura de base de datos sincronizada.")
        except Exception as e:
            print(f"❌ ERROR EN MIGRACIÓN: {e}")
            await session.rollback()

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    body = await request.body()
    body_str = body.decode('utf-8') if body else "Empty body"
    
    # Limpiar errores para evitar que contengan 'bytes' que no se pueden serializar a JSON
    clean_errors = []
    for error in exc.errors():
        error_copy = dict(error)
        if 'input' in error_copy and isinstance(error_copy['input'], bytes):
            error_copy['input'] = error_copy['input'].decode('utf-8')
        clean_errors.append(error_copy)

    print(f"❌ ERROR DE VALIDACIÓN: {clean_errors}")
    print(f"🔍 Cuerpo de la petición: {body_str}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": clean_errors, "body_received": body_str},
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
