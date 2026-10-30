import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Base directory for the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "AI YouTube Studio"
    APP_ENV: str = "production"
    DEBUG: bool = False
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    FRONTEND_PORT: int = 5173

    # Security & Access Keys
    ENCRYPTION_KEY: Optional[str] = None
    STUDIO_ACCESS_KEY: Optional[str] = None

    # CORS & Public Endpoints
    CORS_ORIGINS: str = (
        "https://ai-youtube-studio-ajay.netlify.app,"
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:8000,http://127.0.0.1:8000"
    )
    FRONTEND_PUBLIC_URL: str = "https://ai-youtube-studio-ajay.netlify.app"
    BACKEND_PUBLIC_URL: Optional[str] = None

    # Google OAuth & YouTube API
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # AI Provider Keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None
    PEXELS_API_KEY: Optional[str] = None

    # Cost & Quota Management
    PREFER_FREE_TIERS: bool = True
    DAILY_SPEND_LIMIT_USD: float = 0.0
    MONTHLY_SPEND_LIMIT_USD: float = 0.0
    AUTO_PAUSE_ON_LIMIT: bool = True
    GLOBAL_EMERGENCY_PAUSE: bool = False

    # Storage & DB
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'ai_youtube_studio.db'}"
    MEDIA_DATA_DIR: Path = BASE_DIR / "data" / "channels"

    # FFmpeg binaries
    FFMPEG_PATH: str = "ffmpeg"
    FFPROBE_PATH: str = "ffprobe"

    class Config:
        env_file = BASE_DIR / ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure base data folders exist
os.makedirs(BASE_DIR / "data", exist_ok=True)
os.makedirs(settings.MEDIA_DATA_DIR, exist_ok=True)
