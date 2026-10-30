import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.config import settings, BASE_DIR
from app.utils.ffmpeg_checker import verify_ffmpeg
from app.utils.security import verify_studio_access

router = APIRouter(prefix="/settings", tags=["Settings"], dependencies=[Depends(verify_studio_access)])

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    daily_spend_limit_usd: Optional[float] = None
    prefer_free_tiers: Optional[bool] = None

@router.get("")
def get_system_settings():
    ffmpeg_info = verify_ffmpeg()
    return {
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "host": settings.HOST,
        "port": settings.PORT,
        "frontend_port": settings.FRONTEND_PORT,
        "frontend_public_url": settings.FRONTEND_PUBLIC_URL,
        "backend_public_url": settings.BACKEND_PUBLIC_URL,
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_google_oauth": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        "prefer_free_tiers": settings.PREFER_FREE_TIERS,
        "daily_spend_limit_usd": settings.DAILY_SPEND_LIMIT_USD,
        "monthly_spend_limit_usd": settings.MONTHLY_SPEND_LIMIT_USD,
        "media_data_dir": "data/channels", # Sanitized relative path
        "database_url": "sqlite:///data/ai_youtube_studio.db", # Sanitized relative path
        "ffmpeg": ffmpeg_info
    }

@router.post("")
def update_system_settings(data: SettingsUpdate):
    env_file = BASE_DIR / ".env"
    existing_lines = []
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            existing_lines = f.readlines()

    updates = {}
    if data.gemini_api_key is not None:
        settings.GEMINI_API_KEY = data.gemini_api_key
        updates["GEMINI_API_KEY"] = data.gemini_api_key
    if data.google_client_id is not None:
        settings.GOOGLE_CLIENT_ID = data.google_client_id
        updates["GOOGLE_CLIENT_ID"] = data.google_client_id
    if data.google_client_secret is not None:
        settings.GOOGLE_CLIENT_SECRET = data.google_client_secret
        updates["GOOGLE_CLIENT_SECRET"] = data.google_client_secret
    if data.daily_spend_limit_usd is not None:
        settings.DAILY_SPEND_LIMIT_USD = data.daily_spend_limit_usd
        updates["DAILY_SPEND_LIMIT_USD"] = str(data.daily_spend_limit_usd)
    if data.prefer_free_tiers is not None:
        settings.PREFER_FREE_TIERS = data.prefer_free_tiers
        updates["PREFER_FREE_TIERS"] = "true" if data.prefer_free_tiers else "false"

    # Persist into .env file
    new_lines = []
    seen_keys = set()
    for line in existing_lines:
        if "=" in line and not line.strip().startswith("#"):
            k = line.split("=")[0].strip()
            if k in updates:
                new_lines.append(f"{k}={updates[k]}\n")
                seen_keys.add(k)
                continue
        new_lines.append(line)

    for k, v in updates.items():
        if k not in seen_keys:
            new_lines.append(f"{k}={v}\n")

    with open(env_file, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    return {"message": "Settings updated and saved to .env"}
