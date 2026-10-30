from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ContentPlanCreate(BaseModel):
    channel_id: str
    category: str
    target_format: str = "shorts"
    topic: Optional[str] = None # If none, AI researches autonomously

class ContentPlanResponse(BaseModel):
    id: str
    channel_id: str
    category: str
    target_format: str
    topic: str
    english_topic: Optional[str] = None
    hook: Optional[str] = None
    research_summary: Optional[str] = None
    factual_claims: Optional[str] = None
    sources_and_references: Optional[str] = None
    audience_relevance_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

