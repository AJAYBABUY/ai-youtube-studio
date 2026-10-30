import threading
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db, SessionLocal
from app.models.video_job import VideoJob
from app.models.channel import Channel
from app.models.content_plan import ContentPlan
from app.models.upload_ledger import UploadLedger
from app.schemas.video_job import VideoJobCreate, VideoJobResponse
from app.services.production_pipeline import production_pipeline
from app.services.youtube_service import youtube_service
from app.utils.logger import logger

router = APIRouter(prefix="/jobs", tags=["Jobs & Production"])

def run_job_async(job_id: str):
    db = SessionLocal()
    try:
        production_pipeline.execute_video_production(db, job_id)
    except Exception as e:
        logger.error(f"Error executing job {job_id}: {e}", exc_info=True)
    finally:
        db.close()

@router.get("", response_model=List[VideoJobResponse])
def list_jobs(
    channel_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(VideoJob)
    if channel_id:
        query = query.filter(VideoJob.channel_id == channel_id)
    if status:
        query = query.filter(VideoJob.status == status)

    jobs = query.order_by(VideoJob.created_at.desc()).limit(limit).all()
    results = []
    for j in jobs:
        ch = db.query(Channel).filter(Channel.id == j.channel_id).first()
        ledger = db.query(UploadLedger).filter(UploadLedger.video_job_id == j.id).first()
        res = VideoJobResponse(
            id=j.id,
            channel_id=j.channel_id,
            channel_title=ch.title if ch else "Unknown Channel",
            content_plan_id=j.content_plan_id,
            video_type=j.video_type,
            title=j.title,
            description=j.description,
            tags=j.tags,
            script_telugu=j.script_telugu,
            scene_data=j.scene_data,
            thumbnail_path=j.thumbnail_path,
            subtitle_path=j.subtitle_path,
            rendered_video_path=j.rendered_video_path,
            duration_seconds=j.duration_seconds,
            status=j.status,
            progress_percent=j.progress_percent,
            current_step=j.current_step,
            error_message=j.error_message,
            retry_count=j.retry_count,
            youtube_video_id=ledger.youtube_video_id if ledger else None,
            youtube_url=ledger.youtube_url if ledger else None,
            created_at=j.created_at,
            updated_at=j.updated_at
        )
        results.append(res)
    return results

@router.post("", response_model=VideoJobResponse)
def create_and_start_job(data: VideoJobCreate, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == data.channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")

    job = VideoJob(
        channel_id=ch.id,
        content_plan_id=data.content_plan_id,
        video_type=data.video_type,
        title=data.custom_topic or "",
        script_telugu=data.custom_script,
        status="pending",
        progress_percent=0,
        current_step="Job Queued"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch production worker in background
    threading.Thread(target=run_job_async, args=(job.id,), daemon=True).start()

    return VideoJobResponse(
        id=job.id,
        channel_id=job.channel_id,
        channel_title=ch.title,
        content_plan_id=job.content_plan_id,
        video_type=job.video_type,
        title=job.title,
        status=job.status,
        progress_percent=job.progress_percent,
        current_step=job.current_step,
        duration_seconds=0.0,
        retry_count=0,
        created_at=job.created_at,
        updated_at=job.updated_at
    )

@router.get("/{job_id}", response_model=VideoJobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    j = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    ch = db.query(Channel).filter(Channel.id == j.channel_id).first()
    ledger = db.query(UploadLedger).filter(UploadLedger.video_job_id == j.id).first()
    return VideoJobResponse(
        id=j.id,
        channel_id=j.channel_id,
        channel_title=ch.title if ch else "Unknown Channel",
        content_plan_id=j.content_plan_id,
        video_type=j.video_type,
        title=j.title,
        description=j.description,
        tags=j.tags,
        script_telugu=j.script_telugu,
        scene_data=j.scene_data,
        thumbnail_path=j.thumbnail_path,
        subtitle_path=j.subtitle_path,
        rendered_video_path=j.rendered_video_path,
        duration_seconds=j.duration_seconds,
        status=j.status,
        progress_percent=j.progress_percent,
        current_step=j.current_step,
        error_message=j.error_message,
        retry_count=j.retry_count,
        youtube_video_id=ledger.youtube_video_id if ledger else None,
        youtube_url=ledger.youtube_url if ledger else None,
        created_at=j.created_at,
        updated_at=j.updated_at
    )

@router.post("/{job_id}/retry")
def retry_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = "pending"
    job.progress_percent = 0
    job.current_step = "Retrying job..."
    job.error_message = None
    job.retry_count += 1
    db.commit()

    threading.Thread(target=run_job_async, args=(job.id,), daemon=True).start()
    return {"message": "Job retry launched"}

@router.post("/{job_id}/publish")
def manual_publish_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not job.rendered_video_path:
        raise HTTPException(status_code=400, detail="Video has not been assembled yet.")

    ch = db.query(Channel).filter(Channel.id == job.channel_id).first()
    if not ch or not ch.encrypted_refresh_token:
        raise HTTPException(status_code=400, detail="Channel does not have connected Google OAuth credentials.")

    try:
        job.status = "uploading"
        job.current_step = "Manual Upload in Progress..."
        db.commit()

        pub_res = youtube_service.upload_video(
            encrypted_refresh_token=ch.encrypted_refresh_token,
            video_path=job.rendered_video_path,
            title=job.title,
            description=job.description or "",
            tags=job.tags or "",
            category=ch.category,
            privacy_status="public",
            thumbnail_path=job.thumbnail_path
        )

        ledger = UploadLedger(
            channel_id=ch.id,
            video_job_id=job.id,
            youtube_video_id=pub_res["video_id"],
            youtube_url=pub_res["video_url"],
            privacy_status="public",
            published_at=datetime.utcnow()
        )
        db.add(ledger)
        job.status = "published"
        job.current_step = "Published Successfully"
        db.commit()

        return {"message": "Video published to YouTube successfully", "url": pub_res["video_url"]}
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        job.current_step = f"Upload failed: {str(e)[:100]}"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

