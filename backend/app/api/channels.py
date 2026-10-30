from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.channel import Channel
from app.models.video_job import VideoJob
from app.models.upload_ledger import UploadLedger
from app.schemas.channel import ChannelCreate, ChannelUpdate, ChannelResponse

router = APIRouter(prefix="/channels", tags=["Channels"])

@router.get("", response_model=List[ChannelResponse])
def list_channels(db: Session = Depends(get_db)):
    channels = db.query(Channel).all()
    results = []
    for ch in channels:
        created_count = db.query(VideoJob).filter(VideoJob.channel_id == ch.id).count()
        published_count = db.query(UploadLedger).filter(UploadLedger.channel_id == ch.id).count()
        res = ChannelResponse(
            id=ch.id,
            youtube_channel_id=ch.youtube_channel_id,
            title=ch.title,
            custom_url=ch.custom_url,
            description=ch.description,
            thumbnail_url=ch.thumbnail_url,
            is_active=ch.is_active,
            auto_publish_enabled=ch.auto_publish_enabled,
            category=ch.category,
            video_type_preference=ch.video_type_preference,
            schedule_time=ch.schedule_time,
            schedule_days=ch.schedule_days,
            has_oauth_connected=bool(ch.encrypted_refresh_token),
            total_videos_created=created_count,
            total_videos_published=published_count,
            created_at=ch.created_at,
            updated_at=ch.updated_at
        )
        results.append(res)
    return results

@router.post("", response_model=ChannelResponse)
def create_channel(data: ChannelCreate, db: Session = Depends(get_db)):
    ch = Channel(
        title=data.title,
        youtube_channel_id=data.youtube_channel_id,
        custom_url=data.custom_url,
        description=data.description,
        thumbnail_url=data.thumbnail_url,
        category=data.category,
        video_type_preference=data.video_type_preference,
        schedule_time=data.schedule_time,
        schedule_days=data.schedule_days,
        auto_publish_enabled=data.auto_publish_enabled,
        is_active=data.is_active
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ChannelResponse(
        id=ch.id,
        youtube_channel_id=ch.youtube_channel_id,
        title=ch.title,
        custom_url=ch.custom_url,
        description=ch.description,
        thumbnail_url=ch.thumbnail_url,
        is_active=ch.is_active,
        auto_publish_enabled=ch.auto_publish_enabled,
        category=ch.category,
        video_type_preference=ch.video_type_preference,
        schedule_time=ch.schedule_time,
        schedule_days=ch.schedule_days,
        has_oauth_connected=False,
        total_videos_created=0,
        total_videos_published=0,
        created_at=ch.created_at,
        updated_at=ch.updated_at
    )

@router.get("/{channel_id}", response_model=ChannelResponse)
def get_channel(channel_id: str, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    created_count = db.query(VideoJob).filter(VideoJob.channel_id == ch.id).count()
    published_count = db.query(UploadLedger).filter(UploadLedger.channel_id == ch.id).count()
    return ChannelResponse(
        id=ch.id,
        youtube_channel_id=ch.youtube_channel_id,
        title=ch.title,
        custom_url=ch.custom_url,
        description=ch.description,
        thumbnail_url=ch.thumbnail_url,
        is_active=ch.is_active,
        auto_publish_enabled=ch.auto_publish_enabled,
        category=ch.category,
        video_type_preference=ch.video_type_preference,
        schedule_time=ch.schedule_time,
        schedule_days=ch.schedule_days,
        has_oauth_connected=bool(ch.encrypted_refresh_token),
        total_videos_created=created_count,
        total_videos_published=published_count,
        created_at=ch.created_at,
        updated_at=ch.updated_at
    )

@router.patch("/{channel_id}", response_model=ChannelResponse)
def update_channel(channel_id: str, data: ChannelUpdate, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(ch, k, v)
        
    db.commit()
    db.refresh(ch)
    created_count = db.query(VideoJob).filter(VideoJob.channel_id == ch.id).count()
    published_count = db.query(UploadLedger).filter(UploadLedger.channel_id == ch.id).count()
    return ChannelResponse(
        id=ch.id,
        youtube_channel_id=ch.youtube_channel_id,
        title=ch.title,
        custom_url=ch.custom_url,
        description=ch.description,
        thumbnail_url=ch.thumbnail_url,
        is_active=ch.is_active,
        auto_publish_enabled=ch.auto_publish_enabled,
        category=ch.category,
        video_type_preference=ch.video_type_preference,
        schedule_time=ch.schedule_time,
        schedule_days=ch.schedule_days,
        has_oauth_connected=bool(ch.encrypted_refresh_token),
        total_videos_created=created_count,
        total_videos_published=published_count,
        created_at=ch.created_at,
        updated_at=ch.updated_at
    )

@router.delete("/{channel_id}")
def delete_channel(channel_id: str, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    db.delete(ch)
    db.commit()
    return {"message": "Channel deleted successfully"}

