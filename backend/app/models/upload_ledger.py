import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UploadLedger(Base):
    __tablename__ = "upload_ledgers"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String(64), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True)
    video_job_id = Column(String(64), ForeignKey("video_jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    youtube_video_id = Column(String(128), nullable=False, index=True)
    youtube_url = Column(String(255), nullable=False)
    privacy_status = Column(String(32), default="public") # 'public', 'private', 'unlisted'
    
    published_at = Column(DateTime, nullable=True)
    scheduled_publish_at = Column(DateTime, nullable=True)
    upload_status = Column(String(32), default="confirmed")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    channel = relationship("Channel", back_populates="upload_ledgers")
    video_job = relationship("VideoJob", back_populates="upload_ledger")

