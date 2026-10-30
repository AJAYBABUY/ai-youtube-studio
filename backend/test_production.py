import os
import sys
from pathlib import Path

# Add backend to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.database import Base, engine, SessionLocal
from app.models.channel import Channel
from app.models.video_job import VideoJob
from app.services.production_pipeline import production_pipeline
from app.utils.logger import logger

def test_pipeline():
    logger.info("Initializing DB tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Create or get test channel
    channel = db.query(Channel).filter(Channel.title == "Telugu Tech Facts").first()
    if not channel:
        logger.info("Creating test channel: 'Telugu Tech Facts'...")
        channel = Channel(
            title="Telugu Tech Facts",
            category="Technology",
            video_type_preference="shorts",
            schedule_time="10:00",
            auto_publish_enabled=False
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)

    # 2. Create test job
    logger.info(f"Creating test VideoJob for channel {channel.title} ({channel.id})...")
    job = VideoJob(
        channel_id=channel.id,
        video_type="shorts",
        title="AI టెక్నాలజీ భవిష్యత్తు",
        status="pending",
        current_step="Testing End-to-End Pipeline"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # 3. Execute pipeline
    logger.info(f"Running production pipeline for Job {job.id}...")
    finished_job = production_pipeline.execute_video_production(db, job.id)

    logger.info("=== PRODUCTION TEST RESULTS ===")
    logger.info(f"Status: {finished_job.status}")
    logger.info(f"Title: {finished_job.title}")
    logger.info(f"Duration: {finished_job.duration_seconds}s")
    logger.info(f"Master Video Path: {finished_job.rendered_video_path}")
    logger.info(f"Thumbnail Path: {finished_job.thumbnail_path}")
    logger.info(f"Subtitle Path: {finished_job.subtitle_path}")

    if finished_job.rendered_video_path and os.path.exists(finished_job.rendered_video_path):
        size = os.path.getsize(finished_job.rendered_video_path)
        logger.info(f"Master Video Verified! File size: {size} bytes ({round(size/1024/1024, 2)} MB)")
        print("\nSUCCESS: Video production pipeline executed and verified end-to-end!")
    else:
        logger.error(f"Failed! Error: {finished_job.error_message}")
        print(f"\nFAILED: {finished_job.error_message}")

    db.close()

if __name__ == "__main__":
    test_pipeline()

