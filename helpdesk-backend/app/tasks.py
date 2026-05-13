from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timedelta
from sqlalchemy import select, and_, or_
from app.models.calendar import Event
from app.models.user import User
from app.services.notifications import notification_helper
from app.core.database import AsyncSessionLocal
import asyncio
import os

# Configure Celery
CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
celery_app = Celery("tasks", broker=CELERY_BROKER_URL)

async def scan_and_notify():
    async with AsyncSessionLocal() as db:
        now = datetime.now()
        
        # 1. Reminders for 24 hours ahead (Email)
        target_24h_start = now + timedelta(hours=23, minutes=30)
        target_24h_end = now + timedelta(hours=24, minutes=30)
        
        query_24h = select(Event).where(
            and_(
                Event.start_time >= target_24h_start,
                Event.start_time <= target_24h_end,
                Event.type == "MANTENIMIENTO"
            )
        )
        events_24h = (await db.execute(query_24h)).scalars().all()
        
        for event in events_24h:
            # Send Email via Resend
            print(f"Enviando recordatorio 24h para evento: {event.title}")
            # await notification_service.send_email(event.user_id, "Recordatorio: Mantenimiento Mañana", f"Mañana tienes: {event.title}")

        # 2. Reminders for 2 hours ahead (Push)
        target_2h_start = now + timedelta(hours=1, minutes=30)
        target_2h_end = now + timedelta(hours=2, minutes=30)
        
        query_2h = select(Event).where(
            and_(
                Event.start_time >= target_2h_start,
                Event.start_time <= target_2h_end
            )
        )
        events_2h = (await db.execute(query_2h)).scalars().all()
        
        for event in events_2h:
            # Send Push via OneSignal
            print(f"Enviando Push 2h para evento: {event.title}")
            # await notification_service.send_push([str(event.user_id)], "Evento Próximo", f"Inicia en 2 horas: {event.title}")

@celery_app.task
def run_notifications_scan():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(scan_and_notify())

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Scan every 30 minutes to catch the windows
    sender.add_periodic_task(1800.0, run_notifications_scan.s(), name='scan every 30 mins')
