from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class VideoJobCreate(BaseModel):
    channel_id: str
    content_plan_id: Optional[str] = None
    video_type: str = "shorts"
    custom_topic: Optional[str] = None
    custom_script: Optional[str] = None

class VideoJobResponse(BaseModel):
    id: str
    channel_id: str
    channel_title: Optional[str] = None
    content_plan_id: Optional[str] = None
    video_type: str
    title: str
    description: Optional[str] = None
    tags: Optional[str] = None
    script_telugu: Optional[str] = None
    scene_data: Optional[str] = None
    thumbnail_path: Optional[str] = None
    subtitle_path: Optional[str] = None
    rendered_video_path: Optional[str] = None
    duration_seconds: float
    status: str
    progress_percent: int
    current_step: str
    error_message: Optional[str] = None
    retry_count: int
    youtube_video_id: Optional[str] = None
    youtube_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

