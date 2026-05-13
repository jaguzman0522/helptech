from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.ticket import Ticket
from app.models.inventory import Product
from app.models.maintenance import Maintenance
from app.services.ai_classifier import ai_classifier
from datetime import datetime, timedelta

class MaintenanceAnalyzer:
    async def analyze_asset(self, db: AsyncSession, product_id: int):
        """
        Analiza un activo específico buscando patrones de falla para predecir mantenimiento.
        """
        # 1. Obtener historial reciente de tickets (últimos 90 días)
        threshold_date = datetime.utcnow() - timedelta(days=90)
        query = select(Ticket).where(
            Ticket.asset_id == product_id,
            Ticket.created_at >= threshold_date
        )
        result = await db.execute(query)
        tickets = result.scalars().all()
        
        if len(tickets) < 3:
            return {"status": "HEALTHY", "reason": "Bajo volumen de reportes"}

        # 2. Consultar a la IA sobre la recurrencia de fallas
        descriptions = " | ".join([t.description for t in tickets])
        product_query = select(Product).where(Product.id == product_id)
        product = (await db.execute(product_query)).scalar_one_or_none()
        
        prompt = f"""
        Analiza este historial de fallas para un activo: {product.name if product else 'Desconocido'}.
        Tickets recientes: {descriptions}
        
        ¿Requiere mantenimiento preventivo urgente?
        Responde en JSON:
        {{
            "requiere_mantenimiento": bool,
            "criticidad": "BAJA" | "MEDIA" | "ALTA",
            "motivo": "resumen técnico",
            "accion_sugerida": "ej: limpieza, cambio de pieza"
        }}
        """
        
        try:
            # Reutilizamos el motor de Gemini del clasificador
            response = ai_classifier.model.generate_content(prompt)
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json)
        except:
            return {"status": "ERROR", "reason": "No se pudo procesar con IA"}

maintenance_analyzer = MaintenanceAnalyzer()
