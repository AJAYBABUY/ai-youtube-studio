from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.services.quota_service import quota_service
from app.models.provider_config import UsageRecord
from app.schemas.provider import UsageSummaryResponse

router = APIRouter(prefix="/usage", tags=["Usage & Costs"])

@router.get("/summary", response_model=UsageSummaryResponse)
def get_usage_summary(db: Session = Depends(get_db)):
    daily_spend = quota_service.get_daily_spend(db)
    monthly_spend = quota_service.get_monthly_spend(db)
    total_requests = db.query(UsageRecord).count()
    records = db.query(UsageRecord).order_by(UsageRecord.created_at.desc()).limit(20).all()

    history = [
        {
            "id": r.id,
            "provider": r.provider_name,
            "operation": r.operation_type,
            "cost_usd": r.estimated_cost_usd,
            "tokens": r.tokens_used,
            "date": r.record_date.isoformat()
        }
        for r in records
    ]

    return UsageSummaryResponse(
        total_spend_usd=round(monthly_spend, 4),
        daily_spend_usd=round(daily_spend, 4),
        monthly_spend_usd=round(monthly_spend, 4),
        spend_limit_usd=settings.DAILY_SPEND_LIMIT_USD,
        free_tier_only=settings.PREFER_FREE_TIERS,
        total_requests=total_requests,
        history=history
    )

