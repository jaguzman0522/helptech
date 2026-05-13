import google.generativeai as genai
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ticket import Ticket
from app.services.rule_classifier import rule_classifier

class AIClassifier:
    def __init__(self):
        from app.core.config import settings
        api_key = settings.GEMINI_API_KEY
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def classify_ticket(self, description: str) -> dict:
        # PRIMER NIVEL: Reglas (Rápido y Local)
        rule_result = rule_classifier.clasificar(description)
        
        # Si la confianza de las reglas es alta (>70%), evitamos llamar a la API
        if rule_result["confianza"] > 70:
            return rule_result

        # SEGUNDO NIVEL: IA (Profundo)
        if not self.model:
            return rule_result

        prompt = f"""
        Eres un experto en clasificación de tickets de soporte técnico para el sistema VentaSmart ERP.
        Analiza el siguiente reporte y clasifícalo.
        
        Reporte: "{description}"
        
        Responde ÚNICAMENTE en formato JSON:
        {{
            "departamento_id": int, (1: TI, 2: Mantenimiento, 3: Servicios)
            "categoria_id": int, (8: Software, 9: Hardware, 10: Redes, 1: Electricidad, 2: Infra)
            "prioridad": "BAJA" | "MEDIA" | "ALTA" | "CRITICA",
            "razon": "explicación breve"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Limpiar markdown si existe
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(clean_json)
            data["confianza"] = 95
            data["metodo"] = "ia-gemini"
            return data
        except Exception as e:
            print(f"Error AI Classifier: {e}")
            return rule_result

ai_classifier = AIClassifier()

async def classify_ticket_task(ticket_id: int, description: str, db_factory):
    """
    Tarea de fondo para clasificar el ticket y actualizarlo.
    """
    result = await ai_classifier.classify_ticket(description)
    
    async with db_factory() as db:
        ticket = await db.get(Ticket, ticket_id)
        if ticket:
            ticket.department_id = result.get("departamento_id")
            ticket.category_id = result.get("categoria_id")
            ticket.priority = result.get("prioridad", ticket.priority)
            await db.commit()
