import hashlib
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import Company, User

class DocumentService:
    async def certify_document(self, db: AsyncSession, entity_type: str, data: dict, company_id: int) -> dict:
        """
        Certifica cualquier documento del sistema, generando un JSON estructurado
        con timbrado digital y branding de la empresa.
        """
        # 1. Obtener Branding de la Empresa
        company = await db.get(Company, company_id)
        
        # 2. Generar Timbrado (Hash Único de Validación)
        # El hash se genera basado en el contenido para garantizar que no ha sido alterado
        content_str = f"{entity_type}|{json.dumps(data, sort_keys=True)}|{datetime.utcnow().isoformat()}"
        stamp_hash = hashlib.sha256(content_str.encode()).hexdigest()

        # 3. Construir Estructura Universal
        document_json = {
            "certificacion": {
                "tipo": entity_type.upper(),
                "uuid_validador": stamp_hash,
                "fecha_certificacion": datetime.utcnow().isoformat(),
                "ambiente": "PRODUCCION"
            },
            "header": {
                "empresa": company.name,
                "tax_id": company.tax_id,
                "logo": company.logo_url,
                "contacto": {
                    "telefono": company.phone,
                    "direccion": company.address
                }
            },
            "body": data,
            "footer": {
                "nota_legal": "Este documento ha sido generado y timbrado electrónicamente por VentaSmart ERP. Cualquier alteración invalida su legitimidad.",
                "validar_url": f"http://localhost:8001/verify/{stamp_hash}"
            }
        }

        return document_json

document_service = DocumentService()
