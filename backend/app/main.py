import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(channels_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(planner_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(library_router, prefix="/api")
app.include_router(calendar_router, prefix="/api")
app.include_router(automation_router, prefix="/api")
app.include_router(providers_router, prefix="/api")
app.include_router(usage_router, prefix="/api")
app.include_router(settings_router, prefix="/api")

# Static mount for generated media previews
os.makedirs(settings.MEDIA_DATA_DIR, exist_ok=True)
app.mount("/data", StaticFiles(directory=str(BASE_DIR / "data")), name="data")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "emergency_paused": settings.GLOBAL_EMERGENCY_PAUSE,
    }

