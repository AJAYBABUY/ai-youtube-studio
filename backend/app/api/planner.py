from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from app.database import get_db
from app.models.content_plan import ContentPlan
from app.models.channel import Channel
from app.schemas.content_plan import ContentPlanCreate, ContentPlanResponse
from app.services.research_service import research_service

router = APIRouter(prefix="/planner", tags=["Content Planner"])

@router.get("/plans", response_model=List[ContentPlanResponse])
def get_plans(channel_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(ContentPlan)
    if channel_id:
        query = query.filter(ContentPlan.channel_id == channel_id)
    return query.order_by(ContentPlan.created_at.desc()).all()

@router.post("/research", response_model=ContentPlanResponse)
def generate_ai_topic_research(data: ContentPlanCreate, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == data.channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")

    res = research_service.research_topic(
        db=db,
        channel_id=ch.id,
        category=data.category or ch.category,
        target_format=data.target_format
    )

    plan = ContentPlan(
        channel_id=ch.id,
        category=data.category or ch.category,
        target_format=data.target_format,
        topic=res["topic"],
        english_topic=res.get("english_topic"),
        hook=res.get("hook"),
        research_summary=res.get("research_summary"),
        factual_claims=json.dumps(res.get("factual_claims", []), ensure_ascii=False),
        sources_and_references=json.dumps(res.get("sources_and_references", []), ensure_ascii=False),
        audience_relevance_score=res.get("audience_relevance_score", 9.0),
        status="planned"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/plans/{plan_id}")
def delete_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(ContentPlan).filter(ContentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully"}

