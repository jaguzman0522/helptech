import httpx
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.webhook_log import WebhookLog
from app.models.external_app import ExternalApp

class WebhookService:
    async def trigger_webhook(self, db_factory, external_app_id: int, event: str, data: dict):
        """
        Dispara un webhook de salida de forma asíncrona con política de reintentos.
        """
        async with db_factory() as db:
            # 1. Obtener URL de la app externa
            app = await db.get(ExternalApp, external_app_id)
            if not app or not app.webhook_url:
                return

            payload = {
                "evento": event,
                "timestamp": datetime.utcnow().isoformat(),
                "data": data
            }

            # 2. Intentar envío (3 reintentos)
            async with httpx.AsyncClient() as client:
                for attempt in range(3):
                    try:
                        response = await client.post(
                            app.webhook_url, 
                            json=payload,
                            headers={"X-HelpDesk-Event": event},
                            timeout=5.0
                        )
                        
                        # 3. Registrar Log
                        log = WebhookLog(
                            external_app_id=app.id,
                            event=event,
                            url=app.webhook_url,
                            payload=payload,
                            response_status=response.status_code,
                            response_body=response.text[:1000],
                            retry_count=attempt
                        )
                        db.add(log)
                        await db.commit()
                        
                        if response.status_code < 400:
                            break
                    except Exception as e:
                        if attempt == 2: # Último intento fallido
                            log = WebhookLog(
                                external_app_id=app.id,
                                event=event,
                                url=app.webhook_url,
                                payload=payload,
                                response_status=500,
                                response_body=str(e),
                                retry_count=attempt
                            )
                            db.add(log)
                            await db.commit()
                        await asyncio.sleep(1) # Esperar antes de reintentar

webhook_service = WebhookService()
