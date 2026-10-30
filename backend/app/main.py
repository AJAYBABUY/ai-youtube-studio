import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings, BASE_DIR
from app.database import Base, engine
from app.api import (
    channels_router,
    auth_router,
    planner_router,
    jobs_router,
    library_router,
    calendar_router,
    automation_router,
    providers_router,
    usage_router,
    settings_router,
)
from app.workers.scheduler import start_scheduler, stop_scheduler
from app.utils.logger import logger
from app.utils.ffmpeg_checker import verify_ffmpeg
from app.utils.security import verify_studio_access

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AI YouTube Studio database...")
    Base.metadata.create_all(bind=engine)
    
    # Check FFmpeg
    ffmpeg_stat = verify_ffmpeg()
    if ffmpeg_stat["ffmpeg_available"]:
        logger.info(f"FFmpeg verified: {ffmpeg_stat.get('ffmpeg_version')}")
    else:
        logger.warning("FFmpeg executable was not detected. Local video assembly requires FFmpeg.")

    # Start background scheduler
    start_scheduler()
    logger.info(f"AI YouTube Studio backend running at http://{settings.HOST}:{settings.PORT}")
    
    yield
    
    logger.info("Shutting down background scheduler...")
    stop_scheduler()

app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-Channel Autonomous Telugu YouTube Production & Publishing Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

# 1. Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# 2. Strict CORS Configuration
allowed_origins = [
    "https://ai-youtube-studio-ajay.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if settings.CORS_ORIGINS:
    for o in settings.CORS_ORIGINS.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https://.*(\.netlify\.app|\.trycloudflare\.com)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 3. Mount Protected Routers (Requiring Studio Access Key)
app.include_router(channels_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(planner_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(jobs_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(calendar_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(automation_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(providers_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(usage_router, prefix="/api", dependencies=[Depends(verify_studio_access)])
app.include_router(settings_router, prefix="/api", dependencies=[Depends(verify_studio_access)])

# 4. Mount Routers with Granular Public/Protected Routes
app.include_router(auth_router, prefix="/api")
app.include_router(library_router, prefix="/api")

# 5. Public Health & Diagnostic Endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "auth_required": True,
        "frontend_target": settings.FRONTEND_PUBLIC_URL,
        "emergency_paused": settings.GLOBAL_EMERGENCY_PAUSE,
    }
