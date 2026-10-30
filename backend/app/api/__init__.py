from app.api.channels import router as channels_router
from app.api.auth import router as auth_router
from app.api.planner import router as planner_router
from app.api.jobs import router as jobs_router
from app.api.library import router as library_router
from app.api.calendar import router as calendar_router
from app.api.automation import router as automation_router
from app.api.providers import router as providers_router
from app.api.usage import router as usage_router
from app.api.settings import router as settings_router

__all__ = [
    "channels_router",
    "auth_router",
    "planner_router",
    "jobs_router",
    "library_router",
    "calendar_router",
    "automation_router",
    "providers_router",
    "usage_router",
    "settings_router",
]

