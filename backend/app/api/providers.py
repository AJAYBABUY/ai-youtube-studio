from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.utils.ffmpeg_checker import verify_ffmpeg
from app.models.channel import Channel
from app.models.video_job import VideoJob
from app.schemas.provider import SystemHealthResponse, ProviderStatus

router = APIRouter(prefix="/providers", tags=["AI Integrations"])

@router.get("/status")
def get_providers_status(db: Session = Depends(get_db)):
    ffmpeg_stat = verify_ffmpeg()
    
    # 1. Gemini
    gemini_status = "connected" if settings.GEMINI_API_KEY else "unconfigured"
    gemini_quota = "15 RPM Free Tier Available" if settings.GEMINI_API_KEY else "API Key required for custom prompts (Fallback active)"

    # 2. Edge-TTS (Telugu Neural)
    edge_tts_status = "ready"
    edge_tts_quota = "100% Free / Unlimited Microsoft Neural Speech"

    # 3. Pollinations AI (Images)
    image_status = "ready"
    image_quota = "100% Free / FLUX model"

    # 4. YouTube Data API v3
    channels_with_oauth = db.query(Channel).filter(Channel.encrypted_refresh_token.isnot(None)).count()
    youtube_status = "connected" if channels_with_oauth > 0 else ("ready" if settings.GOOGLE_CLIENT_ID else "unconfigured")
    youtube_quota = f"{channels_with_oauth} Channel(s) Authorized"

    # 5. FFmpeg Media Assembly
    ffmpeg_status = "ready" if ffmpeg_stat["ffmpeg_available"] else "error"

    providers = [
        ProviderStatus(
            name="Google Gemini AI",
            type="llm",
            is_active=True,
            is_free_tier=True,
            status=gemini_status,
            quota_info=gemini_quota,
            last_error=None if settings.GEMINI_API_KEY else "No GEMINI_API_KEY set in .env. Using intelligent curated template engine."
        ),
        ProviderStatus(
            name="Microsoft Edge Neural TTS (Telugu)",
            type="tts",
            is_active=True,
            is_free_tier=True,
            status=edge_tts_status,
            quota_info=edge_tts_quota
        ),
        ProviderStatus(
            name="Pollinations AI Image Generator",
            type="image",
            is_active=True,
            is_free_tier=True,
            status=image_status,
            quota_info=image_quota
        ),
        ProviderStatus(
            name="YouTube Data API v3",
            type="publishing",
            is_active=True,
            is_free_tier=True,
            status=youtube_status,
            quota_info=youtube_quota,
            last_error=None if channels_with_oauth > 0 else "Connect channel via Google OAuth to enable publishing."
        ),
        ProviderStatus(
            name="Local FFmpeg Video Engine",
            type="video",
            is_active=True,
            is_free_tier=True,
            status=ffmpeg_status,
            quota_info=ffmpeg_stat.get("ffmpeg_version", "FFmpeg Local")
        )
    ]

    active_channels = db.query(Channel).filter(Channel.is_active == True).count()
    pending_jobs = db.query(VideoJob).filter(VideoJob.status.in_(["pending", "researching", "scripting", "generating_media", "assembling"])).count()

    return SystemHealthResponse(
        status="healthy" if ffmpeg_stat["ffmpeg_available"] else "degraded",
        ffmpeg_available=ffmpeg_stat["ffmpeg_available"],
        ffmpeg_version=ffmpeg_stat.get("ffmpeg_version"),
        active_channels=active_channels,
        pending_jobs=pending_jobs,
        emergency_paused=settings.GLOBAL_EMERGENCY_PAUSE,
        providers=providers
    )

