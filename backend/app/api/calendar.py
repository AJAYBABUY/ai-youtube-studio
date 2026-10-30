from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.channel import Channel
from app.models.upload_ledger import UploadLedger
from app.models.video_job import VideoJob

router = APIRouter(prefix="/calendar", tags=["Publishing Calendar"])

@router.get("/events")
def get_calendar_events(db: Session = Depends(get_db)):
    events = []
    
    # 1. Past Published Events from UploadLedger
    ledgers = db.query(UploadLedger).order_by(UploadLedger.created_at.desc()).limit(100).all()
    for l in ledgers:
        ch = db.query(Channel).filter(Channel.id == l.channel_id).first()
        job = db.query(VideoJob).filter(VideoJob.id == l.video_job_id).first()
        events.append({
            "id": l.id,
            "title": job.title if job else "Published Video",
            "channel_title": ch.title if ch else "Channel",
            "type": job.video_type if job else "shorts",
            "status": "published",
            "date": l.published_at.isoformat() if l.published_at else l.created_at.isoformat(),
            "youtube_url": l.youtube_url
        })

    # 2. Upcoming Scheduled Projections based on Active Channels' Schedules
    active_channels = db.query(Channel).filter(Channel.is_active == True, Channel.auto_publish_enabled == True).all()
    today = datetime.now()

    for ch in active_channels:
        allowed_days = [d.strip().lower() for d in (ch.schedule_days or "").split(",")]
        sched_time = ch.schedule_time or "10:00"
        try:
            sh, sm = [int(p) for p in sched_time.split(":")]
        except Exception:
            sh, sm = 10, 0

        # Project for next 7 days
        for i in range(1, 8):
            day_target = today + timedelta(days=i)
            day_abbr = day_target.strftime("%a").lower()
            if day_abbr in allowed_days:
                event_datetime = day_target.replace(hour=sh, minute=sm, second=0, microsecond=0)
                events.append({
                    "id": f"proj_{ch.id}_{i}",
                    "title": f"Scheduled {ch.category} Video",
                    "channel_title": ch.title,
                    "type": ch.video_type_preference if ch.video_type_preference != "mixed" else "shorts",
                    "status": "scheduled",
                    "date": event_datetime.isoformat(),
                    "youtube_url": None
                })

    return events

