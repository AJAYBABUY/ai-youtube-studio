import threading
from datetime import datetime, date
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.config import settings
from app.database import SessionLocal
from app.models.channel import Channel
from app.models.video_job import VideoJob
from app.services.production_pipeline import production_pipeline
from app.utils.logger import logger

scheduler = BackgroundScheduler()

def check_scheduled_channel_workflows():
    """
    Evaluates all active channels every minute to trigger automated daily production according to their configured schedule.
    """
    if settings.GLOBAL_EMERGENCY_PAUSE:
        logger.info("Automation loop skipped: Global Emergency Pause is active.")
        return

    db = SessionLocal()
    try:
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        current_weekday_short = now.strftime("%a").lower() # mon, tue, wed, thu, fri, sat, sun

        active_channels = db.query(Channel).filter(
            Channel.is_active == True,
            Channel.auto_publish_enabled == True
        ).all()

        for channel in active_channels:
            # Check days
            allowed_days = [d.strip().lower() for d in (channel.schedule_days or "").split(",")]
            if current_weekday_short not in allowed_days:
                continue

            # Check time match
            if channel.schedule_time == current_time_str:
                # Check if a job has already run for this channel today
                today_start = datetime.combine(date.today(), datetime.min.time())
                existing_today = db.query(VideoJob).filter(
                    VideoJob.channel_id == channel.id,
                    VideoJob.created_at >= today_start
                ).first()

                if existing_today:
                    continue # Already ran today

                logger.info(f"Triggering scheduled daily production for channel: {channel.title} ({channel.id})")
                new_job = VideoJob(
                    channel_id=channel.id,
                    video_type=channel.video_type_preference if channel.video_type_preference != "mixed" else "shorts",
                    title="",
                    status="pending",
                    current_step="Scheduled Trigger Initialized"
                )
                db.add(new_job)
                db.commit()
                db.refresh(new_job)

                # Execute asynchronously in background thread
                threading.Thread(
                    target=run_job_worker,
                    args=(new_job.id,),
                    daemon=True
                ).start()

    except Exception as e:
        logger.error(f"Error in scheduled automation loop: {e}", exc_info=True)
    finally:
        db.close()

def run_job_worker(job_id: str):
    """Worker thread that executes production pipeline for a job."""
    db = SessionLocal()
    try:
        logger.info(f"Worker started for Job {job_id}")
        production_pipeline.execute_video_production(db, job_id)
    except Exception as e:
        logger.error(f"Worker exception for Job {job_id}: {e}", exc_info=True)
    finally:
        db.close()

def recover_interrupted_jobs():
    """Recovers any jobs interrupted by a system restart or power failure."""
    db = SessionLocal()
    try:
        stuck_jobs = db.query(VideoJob).filter(
            VideoJob.status.in_(["pending", "researching", "scripting", "generating_media", "assembling", "validating"])
        ).all()

        if stuck_jobs:
            logger.info(f"Found {len(stuck_jobs)} interrupted jobs from prior run. Resuming...")
            for job in stuck_jobs:
                job.current_step = "Resuming after system restart..."
                db.commit()
                threading.Thread(
                    target=run_job_worker,
                    args=(job.id,),
                    daemon=True
                ).start()
    except Exception as e:
        logger.warning(f"Error in job recovery: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            check_scheduled_channel_workflows,
            trigger=IntervalTrigger(seconds=60),
            id="daily_channel_monitor",
            replace_existing=True
        )
        scheduler.start()
        logger.info("APScheduler background engine started successfully.")
        recover_interrupted_jobs()

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")

