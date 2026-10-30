from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class ProviderStatus(BaseModel):
    name: str
    type: str # 'llm', 'tts', 'image', 'video'
    is_active: bool
    is_free_tier: bool
    status: str # 'connected', 'ready', 'unconfigured', 'error'
    quota_info: Optional[str] = None
    last_error: Optional[str] = None

class SystemHealthResponse(BaseModel):
    status: str
    ffmpeg_available: bool
    ffmpeg_version: Optional[str] = None
    active_channels: int
    pending_jobs: int
    emergency_paused: bool
    providers: List[ProviderStatus]

class UsageSummaryResponse(BaseModel):
    total_spend_usd: float
    daily_spend_usd: float
    monthly_spend_usd: float
    spend_limit_usd: float
    free_tier_only: bool
    total_requests: int
    history: List[dict]

