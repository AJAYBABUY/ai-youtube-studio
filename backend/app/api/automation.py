import threading
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.channel import Channel
from app.models.video_job import VideoJob
from app.workers.scheduler import run_job_worker, scheduler
from app.utils.logger import logger

router = APIRouter(prefix="/automation", tags=["Automation"])

@router.get("/status")
def get_automation_status(db: Session = Depends(get_db)):
    total_active_channels = db.query(Channel).filter(Channel.is_active == True).count()
    auto_enabled_channels = db.query(Channel).filter(Channel.is_active == True, Channel.auto_publish_enabled == True).count()
    active_jobs = db.query(VideoJob).filter(VideoJob.status.in_(["pending", "researching", "scripting", "generating_media", "assembling", "validating", "uploading"])).count()

    return {
        "scheduler_running": scheduler.running if scheduler else False,
        "global_emergency_pause": settings.GLOBAL_EMERGENCY_PAUSE,
        "total_active_channels": total_active_channels,
        "auto_enabled_channels": auto_enabled_channels,
        "active_jobs_running": active_jobs,
    }

@router.post("/pause")
def trigger_emergency_pause():
    settings.GLOBAL_EMERGENCY_PAUSE = True
    logger.warning("GLOBAL EMERGENCY PAUSE ACTIVATED.")
    return {"message": "Global emergency pause enabled. All scheduled publishing is halted.", "emergency_paused": True}

@router.post("/resume")
def resume_automation():
    settings.GLOBAL_EMERGENCY_PAUSE = False
    logger.info("Automation resumed.")
    return {"message": "Automation resumed.", "emergency_paused": False}

@router.post("/channels/{channel_id}/toggle")
def toggle_channel_automation(channel_id: str, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    ch.auto_publish_enabled = not ch.auto_publish_enabled
    db.commit()
    return {
        "channel_id": ch.id,
        "channel_title": ch.title,
        "auto_publish_enabled": ch.auto_publish_enabled
    }

@router.post("/trigger-now")
def trigger_all_channels_now(db: Session = Depends(get_db)):
    """Instantly launches a video generation run for all enabled channels."""
    if settings.GLOBAL_EMERGENCY_PAUSE:
        raise HTTPException(status_code=400, detail="Cannot trigger production: Global Emergency Pause is active.")

    channels = db.query(Channel).filter(Channel.is_active == True, Channel.auto_publish_enabled == True).all()
    if not channels:
        raise HTTPException(status_code=400, detail="No channels currently have automation enabled.")

    triggered = []
    for ch in channels:
        job = VideoJob(
            channel_id=ch.id,
            video_type=ch.video_type_preference if ch.video_type_preference != "mixed" else "shorts",
            status="pending",
            current_step="Immediate Manual Trigger"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        threading.Thread(target=run_job_worker, args=(job.id,), daemon=True).start()
        triggered.append({"channel": ch.title, "job_id": job.id})

    return {"message": f"Triggered {len(triggered)} production jobs.", "jobs": triggered}

