from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChannelBase(BaseModel):
    title: str
    category: str = "Technology"
    video_type_preference: str = "shorts"
    schedule_time: str = "10:00"
    schedule_days: str = "mon,tue,wed,thu,fri,sat,sun"
    auto_publish_enabled: bool = False
    is_active: bool = True

class ChannelCreate(ChannelBase):
    youtube_channel_id: Optional[str] = None
    custom_url: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None

class ChannelUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    video_type_preference: Optional[str] = None
    schedule_time: Optional[str] = None
    schedule_days: Optional[str] = None
    auto_publish_enabled: Optional[bool] = None
    is_active: Optional[bool] = None

class ChannelResponse(ChannelBase):
    id: str
    youtube_channel_id: Optional[str] = None
    custom_url: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    has_oauth_connected: bool = False
    total_videos_created: int = 0
    total_videos_published: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

