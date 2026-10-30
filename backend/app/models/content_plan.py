import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ContentPlan(Base):
    __tablename__ = "content_plans"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String(64), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(64), nullable=False)
    target_format = Column(String(32), default="shorts") # 'shorts' or 'long_form'
    
    topic = Column(String(512), nullable=False) # Telugu topic
    english_topic = Column(String(512), nullable=True)
    hook = Column(Text, nullable=True)
    research_summary = Column(Text, nullable=True)
    factual_claims = Column(Text, nullable=True) # JSON list
    sources_and_references = Column(Text, nullable=True) # JSON list
    audience_relevance_score = Column(Float, default=8.5)
    
    status = Column(String(32), default="planned") # 'planned', 'generating', 'completed', 'discarded'
    created_at = Column(DateTime, default=datetime.utcnow)

    channel = relationship("Channel", back_populates="content_plans")
    video_jobs = relationship("VideoJob", back_populates="content_plan")

