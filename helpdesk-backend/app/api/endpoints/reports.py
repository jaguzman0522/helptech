from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.ticket import Ticket, Department
from app.models.inventory import InventoryMovement, Product
from app.models.user import User
from app.api import deps

router = APIRouter()

@router.get("/global-costs")
async def get_global_costs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Lógica: Sumar cantidad * costo de los productos en movimientos vinculados a tickets
    query = (
        select(
            Department.name,
            func.sum(InventoryMovement.quantity * 0).label("total_cost"), # Product.cost no existe, usando 0 temporalmente
            func.count(func.distinct(Ticket.id)).label("num_tickets")
        )
        .join(Ticket, InventoryMovement.ticket_id == Ticket.id)
        .join(Department, Ticket.department_id == Department.id)
        .join(Product, InventoryMovement.product_id == Product.id)
        .where(Ticket.company_id == current_user.company_id)
        .group_by(Department.name)
    )
    
    result = await db.execute(query)
    return [
        {"departamento": row.name, "costo": row.total_cost or 0, "tickets": row.num_tickets}
        for row in result.all()
    ]

@router.get("/kpis")
async def get_dashboard_kpis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from sqlalchemy import func, avg, extract
    from app.models.ticket import Ticket, ChatMessage
    from app.models.inventory import InventoryMovement
    
    # 1. SLA de Respuesta Promedio (Minutos)
    # Comparar created_at del ticket vs el primer mensaje/update
    sla_query = select(avg(extract('epoch', Ticket.updated_at - Ticket.created_at))).where(
        Ticket.company_id == current_user.company_id,
        Ticket.status != "ABIERTO"
    )
    sla_seconds = (await db.execute(sla_query)).scalar() or 0
    sla_minutes = round(sla_seconds / 60, 2)

    # 2. Costo de Soporte (Materiales consumidos)
    cost_query = select(func.sum(InventoryMovement.quantity * 50)).where( # 50 es un costo mock
        InventoryMovement.ticket_id != None
    )
    total_cost = (await db.execute(cost_query)).scalar() or 0

    # 3. Precisión IA (Total - Reasignaciones) / Total
    total_tickets = (await db.execute(select(func.count(Ticket.id)).where(Ticket.company_id == current_user.company_id))).scalar() or 1
    # Mock: Asumimos que audit_logs tiene las reasignaciones
    precision_ia = 94.5 # Valor base mockeado por ahora

    # 4. Actividad Semanal (Tickets por día)
    weekly_query = select(
        func.date(Ticket.created_at), 
        func.count(Ticket.id)
    ).where(
        Ticket.company_id == current_user.company_id,
        Ticket.created_at >= datetime.utcnow() - timedelta(days=7)
    ).group_by(func.date(Ticket.created_at))
    
    weekly_res = await db.execute(weekly_query)
    weekly_data = [{"date": str(row[0]), "count": row[1]} for row in weekly_res.all()]

    return {
        "sla_minutes": sla_minutes,
        "total_cost": total_cost,
        "ia_accuracy": precision_ia,
        "weekly_activity": weekly_data
    }

@router.get("/technician-performance")
async def get_tech_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # KPIs de rendimiento del personal
    query = (
        select(
            User.full_name,
            func.count(Ticket.id).label("total_tickets"),
            func.avg(func.extract('epoch', Ticket.updated_at - Ticket.created_at) / 3600).label("avg_resolution_time")
        )
        .join(Ticket, Ticket.technician_id == User.id)
        .where(Ticket.company_id == current_user.company_id)
        .group_by(User.full_name)
    )
    
    result = await db.execute(query)
    return [
        {
            "nombre": row.full_name, 
            "tickets": row.total_tickets, 
            "promedio_resolucion": round(row.avg_resolution_time or 0, 2)
        }
        for row in result.all()
    ]

@router.get("/asset-trazability/{asset_id}")
async def get_asset_trazability(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Historial de inversión por equipo específico
    query = (
        select(InventoryMovement, Product.name)
        .join(Product, InventoryMovement.product_id == Product.id)
        .where(and_(
            InventoryMovement.product_id == asset_id,
            Product.company_id == current_user.company_id
        ))
    )
    
    result = await db.execute(query)
    return result.all()
