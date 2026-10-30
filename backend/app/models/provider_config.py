import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, Float, Integer, DateTime, Date, Text
from app.database import Base

class ProviderConfig(Base):
    __tablename__ = "provider_configs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_name = Column(String(64), unique=True, nullable=False) # 'gemini', 'edge_tts', 'pollinations', 'pexels', 'openai'
    provider_type = Column(String(32), nullable=False) # 'llm', 'tts', 'image', 'video'
    is_active = Column(Boolean, default=True)
    is_free_tier = Column(Boolean, default=True)
    api_key_encrypted = Column(Text, nullable=True)
    custom_endpoint = Column(String(255), nullable=True)
    status_message = Column(String(255), default="Ready")
    last_checked_at = Column(DateTime, default=datetime.utcnow)

class UsageRecord(Base):
    __tablename__ = "usage_records"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_name = Column(String(64), nullable=False, index=True)
    channel_id = Column(String(64), nullable=True)
    record_date = Column(Date, default=date.today, index=True)
    
    requests_count = Column(Integer, default=1)
    tokens_used = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    operation_type = Column(String(64), nullable=True) # 'topic_research', 'scripting', 'tts', 'image_generation'
    
    created_at = Column(DateTime, default=datetime.utcnow)

