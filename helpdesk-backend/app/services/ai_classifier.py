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
        You are an expert in technical support ticket classification for the VentaSmart ERP system.
        Analyze the following report and classify it.
        
        Report: "{description}"
        
        Respond ONLY in JSON format:
        {{
            "department_id": int, (1: IT, 2: Maintenance, 3: Services)
            "category_id": int, (8: Software, 9: Hardware, 10: Networks, 1: Electricity, 2: Infra)
            "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "reason": "brief explanation"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Limpiar markdown si existe
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(clean_json)
            data["confidence"] = 95
            data["method"] = "ia-gemini"
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
            ticket.department_id = result.get("department_id")
            ticket.category_id = result.get("category_id")
            ticket.priority = result.get("priority", ticket.priority)
            await db.commit()
