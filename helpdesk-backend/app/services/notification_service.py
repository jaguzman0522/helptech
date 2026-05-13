from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.services.notifications import notification_helper
from app.core.config import settings
import os

class NotificationService:
    async def create_notification(
        self, 
        db: AsyncSession, 
        user_id: int, 
        title: str, 
        message: str, 
        notif_type: str = "system",
        url: str = None,
        send_email: bool = False,
        user_email: str = None
    ):
        # 1. Persistencia en Base de Datos
        db_notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            url=url
        )
        db.add(db_notif)
        await db.commit()
        await db.refresh(db_notif)
        
        # 2. Tiempo Real (Pusher)
        await notification_helper.send_push(
            channel=f"user-{user_id}",
            event="new-notification",
            data={
                "id": db_notif.id,
                "title": title,
                "message": message,
                "url": url,
                "type": notif_type
            }
        )
        
        # 3. Email (Brevo)
        if send_email and user_email and settings.BREVO_API_KEY:
            subject = f"Nueva notificación: {title}"
            html = f"<h2>{title}</h2><p>{message}</p><br><a href='{url}'>Ver más detalles</a>"
            await notification_helper.send_email(user_email, subject, html)
            db_notif.email_sent = True
            await db.commit()
            
        return db_notif

notification_service = NotificationService()
