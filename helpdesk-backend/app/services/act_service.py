import hashlib
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.inventory import Assignment, Product
from app.models.user import User, Company

class ActService:
    async def generate_legal_act_json(self, db: AsyncSession, assignment_id: int) -> dict:
        """
        Genera un JSON de alta calidad estructurado para el Acta de Entrega,
        incluyendo timbrado digital y datos de empresa.
        """
        # 1. Obtener datos completos de la asignación
        query = select(Assignment).where(Assignment.id == assignment_id)
        result = await db.execute(query)
        assign = result.scalar_one_or_none()
        
        if not assign:
            return None

        # 2. Obtener contexto (Empresa, Usuario, Producto)
        company = await db.get(Company, assign.company_id)
        user = await db.get(User, assign.user_id)
        product = await db.get(Product, assign.product_id)

        # 3. Generar Timbrado (Hash de Validación)
        raw_data = f"{assign.act_code}|{user.id}|{product.id}|{datetime.utcnow().isoformat()}"
        stamp_hash = hashlib.sha256(raw_data.encode()).hexdigest()
        
        # Guardar el hash en la asignación para auditoría
        assign.stamp_hash = stamp_hash
        await db.commit()

        # 4. Estructurar el JSON de Alta Calidad
        acta_json = {
            "metadata": {
                "version": "1.0",
                "tipo_documento": "ACTA_DE_ENTREGA_ACTIVO",
                "codigo_acta": assign.act_code,
                "timbrado": stamp_hash,
                "fecha_emision": datetime.utcnow().isoformat()
            },
            "empresa": {
                "nombre": company.name,
                "tax_id": company.tax_id,
                "logo_url": company.logo_url,
                "direccion": company.address,
                "telefono": company.phone
            },
            "beneficiario": {
                "nombre_completo": user.full_name,
                "departamento": user.role, # O departamento real si existe
                "identificacion": user.id
            },
            "activo": {
                "codigo": product.code,
                "nombre": product.name,
                "tipo": product.type,
                "num_serie": product.serial_number,
                "condicion": assign.condition_on_delivery
            },
            "legal": {
                "clausula": "El beneficiario se compromete a cuidar el equipo y utilizarlo exclusivamente para fines laborales. En caso de daño por negligencia, se aplicarán las políticas internas.",
                "firma_digital": user.signature_url
            }
        }

        return acta_json

act_service = ActService()
