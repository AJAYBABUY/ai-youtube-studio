import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.config import settings
from app.models.video_job import VideoJob
from app.models.channel import Channel
from app.models.upload_ledger import UploadLedger
from app.utils.security import verify_studio_access

router = APIRouter(prefix="/library", tags=["Video Library"])

@router.get("/videos", dependencies=[Depends(verify_studio_access)])
def get_library_videos(channel_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(VideoJob).filter(VideoJob.status.in_(["ready_to_upload", "published"]))
    if channel_id:
        query = query.filter(VideoJob.channel_id == channel_id)

    jobs = query.order_by(VideoJob.created_at.desc()).all()
    results = []
    for j in jobs:
        ch = db.query(Channel).filter(Channel.id == j.channel_id).first()
        ledger = db.query(UploadLedger).filter(UploadLedger.video_job_id == j.id).first()
        results.append({
            "id": j.id,
            "channel_id": j.channel_id,
            "channel_title": ch.title if ch else "Unknown",
            "title": j.title,
            "video_type": j.video_type,
            "duration_seconds": j.duration_seconds,
            "status": j.status,
            "thumbnail_url": f"/api/library/thumbnail/{j.id}" if j.thumbnail_path else None,
            "stream_url": f"/api/library/stream/{j.id}" if j.rendered_video_path else None,
            "youtube_url": ledger.youtube_url if ledger else None,
            "youtube_video_id": ledger.youtube_video_id if ledger else None,
            "published_at": ledger.published_at if ledger else None,
            "created_at": j.created_at
        })
    return results

@router.get("/stream/{job_id}", dependencies=[Depends(verify_studio_access)])
def stream_video(job_id: str, db: Session = Depends(get_db)):
    """Streams the rendered MP4 file for a given job, enforcing authentication and path traversal restrictions."""
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job or not job.rendered_video_path or not os.path.exists(job.rendered_video_path):
        raise HTTPException(status_code=404, detail="Rendered video file not found")
    
    file_path = Path(job.rendered_video_path).resolve()
    media_root = settings.MEDIA_DATA_DIR.resolve()
    
    # Path traversal guard: must be strictly inside data/channels
    try:
        file_path.relative_to(media_root)
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied: invalid media location")

    return FileResponse(str(file_path), media_type="video/mp4")

@router.get("/thumbnail/{job_id}", dependencies=[Depends(verify_studio_access)])
def get_thumbnail(job_id: str, db: Session = Depends(get_db)):
    """Serves the thumbnail JPEG for a given job, enforcing authentication and path traversal restrictions."""
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job or not job.thumbnail_path or not os.path.exists(job.thumbnail_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    file_path = Path(job.thumbnail_path).resolve()
    media_root = settings.MEDIA_DATA_DIR.resolve()

    try:
        file_path.relative_to(media_root)
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied: invalid media location")

    return FileResponse(str(file_path), media_type="image/jpeg")
