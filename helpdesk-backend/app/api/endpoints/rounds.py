from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.round import SupportRound
from app.models.user import User
from app.schemas.round import SupportRoundCreate, SupportRoundOut
from app.api import deps

router = APIRouter()

@router.get("/")
async def list_rounds(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    try:
        from sqlalchemy import text
        
        # VERIFICACIÓN DE ESTRUCTURA (Solo para debug en consola del servidor)
        # result_cols = await db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'support_rounds'"))
        # print(f"🔍 COLUMNAS DETECTADAS: {[r[0] for r in result_cols.fetchall()]}")

        # Intento de consulta directa para ver si la tabla existe
        result = await db.execute(text("SELECT * FROM support_rounds WHERE company_id = :cid ORDER BY created_at DESC"), {"cid": current_user.company_id})
        rows = result.fetchall()
        
        rounds_list = []
        for r in rows:
            # Mapping row to dict safely
            rounds_list.append({
                "id": r[0],
                "company_id": r[1],
                "area": r[2],
                "responsible_name": r[3],
                "technician_name": r[4],
                "has_incident": r[5],
                "incident_description": r[6],
                "action_taken": r[7],
                "visit_time": r[8].isoformat() if r[8] and hasattr(r[8], 'isoformat') else str(r[8]),
                "created_at": r[9].isoformat() if r[9] and hasattr(r[9], 'isoformat') else str(r[9])
            })
        return rounds_list
    except Exception as e:
        print(f"❌ DEBUG ROUNDS: {str(e)}")
        return [] # Return empty to avoid 500 and see if it unblocks

@router.post("/")
async def create_round(
    round_in: SupportRoundCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from sqlalchemy import text
    from datetime import datetime
    
    # 1. Asegurar que la tabla existe (Fallback agresivo)
    try:
        await db.execute(text("""
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
        await db.commit()
    except Exception as e:
        print(f"⚠️ Fallo al asegurar tabla: {e}")
        await db.rollback()

    try:
        # Convert visit_time if it's a string
        v_time = round_in.visit_time
        if isinstance(v_time, str):
            v_time = datetime.fromisoformat(v_time.replace('Z', ''))

        query = text("""
            INSERT INTO support_rounds 
            (company_id, area, responsible_name, technician_name, has_incident, incident_description, action_taken, visit_time, created_at)
            VALUES (:cid, :area, :resp, :tech, :inc, :desc, :act, :vtime, :now)
            RETURNING id, created_at
        """)
        
        now = datetime.utcnow()
        params = {
            "cid": current_user.company_id,
            "area": round_in.area,
            "resp": round_in.responsible_name,
            "tech": round_in.technician_name,
            "inc": round_in.has_incident,
            "desc": round_in.incident_description,
            "act": round_in.action_taken,
            "vtime": v_time,
            "now": now
        }
        
        result = await db.execute(query, params)
        row = result.fetchone()
        await db.commit()
        
        return {
            "id": row[0],
            "area": round_in.area,
            "responsible_name": round_in.responsible_name,
            "technician_name": round_in.technician_name,
            "has_incident": round_in.has_incident,
            "incident_description": round_in.incident_description,
            "action_taken": round_in.action_taken,
            "visit_time": v_time.isoformat(),
            "created_at": row[1].isoformat() if row[1] else now.isoformat()
        }
    except Exception as e:
        import traceback
        print(f"❌ ERROR SQL CREATE_ROUND: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error al guardar (SQL): {str(e)}")
