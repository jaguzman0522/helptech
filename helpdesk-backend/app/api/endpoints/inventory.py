from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import List, Optional
import json

from app.core.database import get_db
from app.models.inventory import Product, InventoryMovement, Warehouse, Provider, ProductType
from app.models.user import User
from app.models.sequence import Sequence
from app.api import deps
from app.core.middleware import log_action

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    query = select(Product).where(Product.company_id == current_user.company_id)
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Manual serialization to avoid circular references and 500 errors
    return [
        {
            "id": p.id,
            "code": p.code,
            "barcode": p.barcode,
            "name": p.name,
            "description": p.description,
            "type": p.type,
            "status": p.status,
            "stock_total": p.stock_total,
            "stock_min": p.stock_min,
            "brand": p.brand,
            "model": p.model,
            "serial_number": p.serial_number,
            "category_id": p.category_id,
            "specs": p.specs
        }
        for p in products
    ]

@router.get("/assets/{identifier}")
async def get_asset_360(
    identifier: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from sqlalchemy import or_
    from app.models.ticket import Ticket
    from app.models.inventory import Product, InventoryMovement
    
    # Búsqueda Dual: Código Interno OR Barcode
    query = select(Product).where(
        Product.company_id == current_user.company_id,
        or_(
            Product.code == identifier,
            Product.barcode == identifier
        )
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
        
    # Obtener Tickets Relacionados
    tickets_query = select(Ticket).where(Ticket.asset_id == product.id).order_by(Ticket.created_at.desc())
    tickets_result = await db.execute(tickets_query)
    
    # Obtener Movimientos de Inventario (Kardex)
    movements_query = select(InventoryMovement).where(InventoryMovement.product_id == product.id).order_by(InventoryMovement.created_at.desc())
    movements_result = await db.execute(movements_query)
    
    return {
        "product": product,
        "tickets": tickets_result.scalars().all(),
        "movements": movements_result.scalars().all(),
        "current_assignment": {
            "user": "Juan Pérez (Mock)",
            "date": "2024-01-15",
            "condition": "Excelente"
        }
    }

from app.services.document_service import document_service

@router.get("/purchase-orders/{po_id}/document")
async def get_po_document(
    po_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.inventory import PurchaseOrder, PurchaseOrderItem, Provider
    po = await db.get(PurchaseOrder, po_id)
    if not po or po.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    
    # Obtener items y proveedor
    provider = await db.get(Provider, po.provider_id)
    items_query = select(PurchaseOrderItem).where(PurchaseOrderItem.order_id == po.id)
    items = (await db.execute(items_query)).scalars().all()
    
    data = {
        "folio": po.code,
        "proveedor": provider.name if provider else "N/A",
        "total": po.total,
        "items": [
            {"product_id": i.product_id, "cantidad": i.quantity, "costo": i.cost}
            for i in items
        ]
    }
    
    return await document_service.certify_document(db, "ORDEN_DE_COMPRA", data, current_user.company_id)

async def get_next_code(db: AsyncSession, entity: str, prefix: str) -> str:
    result = await db.execute(
        select(Sequence).where(Sequence.entity == entity).with_for_update()
    )
    seq = result.scalar_one_or_none()
    if not seq:
        seq = Sequence(entity=entity, last_number=0)
        db.add(seq)
    seq.last_number += 1
    await db.flush()
    return f"{prefix}-{seq.last_number:06d}"

import uuid

@router.post("/", response_model=dict)
async def create_product(
    product_in: dict, # Simplified for example, should use schema
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    code = await get_next_code(db, "Product", "PRD")
    
    # Logic for auto-barcode based on category
    barcode = f"BC-{product_in.get('category_id')}-{code}"
    
    # Extraer marca y modelo de specs si vienen del nuevo formulario
    specs = product_in.get("specs", {})
    brand = specs.get("marca") if specs else None
    model = specs.get("modelo") if specs else None

    db_product = Product(
        code=code,
        barcode=barcode,
        public_token=str(uuid.uuid4()), # Generar Token QR único
        name=product_in.get("nombre"),
        description=product_in.get("descripcion"),
        type=product_in.get("tipo"),
        stock_total=product_in.get("stock", 0),
        stock_min=product_in.get("stockMinimo", 5),
        company_id=current_user.company_id,
        category_id=product_in.get("categoriaId"),
        provider_id=product_in.get("proveedorId"),
        serial_number=product_in.get("numeroSerie"),
        brand=brand,
        model=model,
        specs=specs
    )
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return {
        "id": db_product.id,
        "code": db_product.code,
        "name": db_product.name,
        "status": "success"
    }

@router.post("/purchase-orders", response_model=dict)
async def create_purchase_order(
    po_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.inventory import PurchaseOrder, PurchaseOrderItem
    code = await get_next_code(db, "PurchaseOrder", "PO")
    
    db_po = PurchaseOrder(
        code=code,
        provider_id=po_in.get("proveedorId"),
        total=po_in.get("total", 0),
        status="PENDIENTE",
        company_id=current_user.company_id
    )
    db.add(db_po)
    await db.flush()
    
    for item in po_in.get("items", []):
        db_item = PurchaseOrderItem(
            order_id=db_po.id,
            product_id=item.get("id"),
            quantity=item.get("cantidad"),
            cost=item.get("costo")
        )
        db.add(db_item)
        
    await db.commit()
    return {"status": "success", "code": code, "order_id": db_po.id}

@router.post("/movements", response_model=dict)
async def create_movement(
    mov_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    code = await get_next_code(db, "Movement", "MOV")
    
    # Atomic stock update logic
    result = await db.execute(select(Product).where(Product.id == mov_in.get("productoId")))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if mov_in.get("tipo") == "SALIDA" and product.stock_total < mov_in.get("cantidad"):
        raise HTTPException(status_code=400, detail="Insufficient stock")
        
    if mov_in.get("tipo") == "ENTRADA":
        product.stock_total += mov_in.get("cantidad")
    else:
        product.stock_total -= mov_in.get("cantidad")
        
    db_movement = InventoryMovement(
        code=code,
        product_id=mov_in.get("productoId"),
        warehouse_id=mov_in.get("almacenId"),
        type=mov_in.get("tipo"),
        quantity=mov_in.get("cantidad"),
        reason=mov_in.get("motivo"),
        ticket_id=mov_in.get("ticketId"),
        user_id=current_user.id
    )
    
    db.add(db_movement)
    await db.commit()
    return {"status": "success", "code": code, "new_stock": product.stock_total}
