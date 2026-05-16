import httpx
import pusher
from app.core.config import settings

class NotificationService:
    def __init__(self):
        if settings.PUSHER_KEY:
            self.pusher_client = pusher.Pusher(
                app_id=settings.PUSHER_APP_ID,
                key=settings.PUSHER_KEY,
                secret=settings.PUSHER_SECRET,
                cluster=settings.PUSHER_CLUSTER,
                ssl=True
            )
        else:
            self.pusher_client = None

    async def send_push(self, channel: str, event: str, data: dict):
        """Envia notificaciones en tiempo real via Pusher"""
        if self.pusher_client:
            try:
                self.pusher_client.trigger(channel, event, data)
            except Exception as e:
                print(f"Error Pusher: {e}")
        else:
            print("Pusher no configurado.")

    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Envia correos profesionales via Brevo (ex Sendinblue) o los imprime en consola en desarrollo"""
        
        # Modo Desarrollo: Imprimir en consola para validacion rapida
        if settings.ENVIRONMENT == "development":
            print("\n" + "="*50)
            print("🚀 [MODO DESARROLLO] ENVÍO DE EMAIL SIMULADO")
            print(f"PARA: {to_email}")
            print(f"ASUNTO: {subject}")
            print("-" * 50)
            # Limpiar un poco el HTML para la consola
            import re
            clean_text = re.sub('<[^<]+?>', '', html_content)
            print(f"CONTENIDO: {clean_text}")
            print("="*50 + "\n")
            return True

        if not settings.BREVO_API_KEY:
            print("Brevo API Key no configurada. Saltando email.")
            return

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": settings.BREVO_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "sender": {"name": settings.EMAIL_NAME, "email": settings.EMAIL_FROM},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_content
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code >= 400:
                    print(f"Error Brevo: {response.text}")
            except Exception as e:
                print(f"Error enviando email: {e}")

notification_helper = NotificationService()
