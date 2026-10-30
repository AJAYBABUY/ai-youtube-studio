import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class VideoJob(Base):
    __tablename__ = "video_jobs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String(64), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True)
    content_plan_id = Column(String(64), ForeignKey("content_plans.id", ondelete="SET NULL"), nullable=True)
    
    video_type = Column(String(32), default="shorts") # 'shorts', 'long_form'
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(Text, nullable=True) # comma-separated
    
    script_telugu = Column(Text, nullable=True)
    scene_data = Column(Text, nullable=True) # JSON list of scene breakdown
    
    thumbnail_path = Column(String(512), nullable=True)
    subtitle_path = Column(String(512), nullable=True)
    rendered_video_path = Column(String(512), nullable=True)
    duration_seconds = Column(Float, default=0.0)
    
    # Execution status: pending, researching, scripting, generating_media, assembling, validating, ready_to_upload, uploading, published, failed
    status = Column(String(32), default="pending", index=True)
    progress_percent = Column(Integer, default=0)
    current_step = Column(String(128), default="Initialized")
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    channel = relationship("Channel", back_populates="video_jobs")
    content_plan = relationship("ContentPlan", back_populates="video_jobs")
    upload_ledger = relationship("UploadLedger", back_populates="video_job", uselist=False)

