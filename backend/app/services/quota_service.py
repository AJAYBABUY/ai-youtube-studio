from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config import settings
from app.models.provider_config import UsageRecord
from app.utils.logger import logger

class QuotaService:
    def record_usage(
        self,
        db: Session,
        provider_name: str,
        operation_type: str,
        channel_id: str = None,
        tokens: int = 0,
        cost_usd: float = 0.0
    ):
        """Records an API call with token and cost tracking."""
        record = UsageRecord(
            provider_name=provider_name,
            operation_type=operation_type,
            channel_id=channel_id,
            record_date=date.today(),
            tokens_used=tokens,
            estimated_cost_usd=cost_usd,
        )
        db.add(record)
        db.commit()

    def get_daily_spend(self, db: Session) -> float:
        today = date.today()
        result = db.query(func.sum(UsageRecord.estimated_cost_usd)).filter(UsageRecord.record_date == today).scalar()
        return float(result or 0.0)

    def get_monthly_spend(self, db: Session) -> float:
        today = date.today()
        first_of_month = date(today.year, today.month, 1)
        result = db.query(func.sum(UsageRecord.estimated_cost_usd)).filter(UsageRecord.record_date >= first_of_month).scalar()
        return float(result or 0.0)

    def is_quota_exceeded(self, db: Session) -> bool:
        if not settings.AUTO_PAUSE_ON_LIMIT:
            return False

        if settings.DAILY_SPEND_LIMIT_USD > 0.0:
            if self.get_daily_spend(db) >= settings.DAILY_SPEND_LIMIT_USD:
                logger.warning("Daily spend limit reached! Pausing further operations.")
                return True

        if settings.MONTHLY_SPEND_LIMIT_USD > 0.0:
            if self.get_monthly_spend(db) >= settings.MONTHLY_SPEND_LIMIT_USD:
                logger.warning("Monthly spend limit reached! Pausing further operations.")
                return True

        return False

quota_service = QuotaService()

