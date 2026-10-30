import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    youtube_channel_id = Column(String(128), unique=True, index=True, nullable=True)
    title = Column(String(255), nullable=False)
    custom_url = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(512), nullable=True)
    
    # State & Automations
    is_active = Column(Boolean, default=True)
    auto_publish_enabled = Column(Boolean, default=False)
    
    # Content Strategy
    category = Column(String(64), default="Technology")
    video_type_preference = Column(String(32), default="shorts") # 'shorts', 'long_form', 'mixed'
    language = Column(String(16), default="te") # Telugu
    
    # Publishing Schedule
    schedule_time = Column(String(16), default="10:00") # 24h format HH:MM
    schedule_days = Column(String(64), default="mon,tue,wed,thu,fri,sat,sun")
    
    # Secure Credentials
    encrypted_refresh_token = Column(Text, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    content_plans = relationship("ContentPlan", back_populates="channel", cascade="all, delete-orphan")
    video_jobs = relationship("VideoJob", back_populates="channel", cascade="all, delete-orphan")
    upload_ledgers = relationship("UploadLedger", back_populates="channel", cascade="all, delete-orphan")

