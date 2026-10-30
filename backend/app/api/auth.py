from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.channel import Channel
from app.services.auth_service import auth_service
from app.utils.encryption import encrypt_token
from app.utils.security import verify_studio_access, validate_access_key_plain
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/verify-key")
def verify_access_key(payload: dict = Body(...)):
    """Validates user-provided Studio Access Key for frontend session."""
    provided_key = payload.get("key", "").strip()
    is_valid = validate_access_key_plain(provided_key)
    return {"valid": is_valid}

@router.get("/key-status")
def get_key_status():
    """Reports whether studio authentication is required."""
    return {"auth_required": True}

@router.get("/google/url", dependencies=[Depends(verify_studio_access)])
def get_google_auth_url(channel_id: str = Query(None)):
    """Returns Google OAuth 2.0 authorization URL."""
    try:
        url = auth_service.get_authorization_url(state=channel_id)
        return {"authorization_url": url}
    except Exception as e:
        logger.error(f"Failed to generate OAuth URL: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Google OAuth configuration error: {str(e)}. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env."
        )

@router.get("/google/callback")
def google_oauth_callback(code: str = Query(...), state: str = Query(None), db: Session = Depends(get_db)):
    """Handles OAuth callback, saves encrypted refresh token, and connects YouTube channel."""
    frontend_base = settings.FRONTEND_PUBLIC_URL.rstrip('/') if settings.FRONTEND_PUBLIC_URL else f"http://localhost:{settings.FRONTEND_PORT}"
    try:
        creds_data = auth_service.exchange_code_for_credentials(code)
        refresh_token = creds_data.get("refresh_token")
        channels_found = creds_data.get("channels", [])

        if not refresh_token:
            logger.warning("No refresh token received. User might have previously authorized; prompt=consent is required.")

        encrypted_ref = encrypt_token(refresh_token) if refresh_token else ""

        # If a specific channel_id was passed in state, link to that channel
        if state:
            target_ch = db.query(Channel).filter(Channel.id == state).first()
            if target_ch:
                if encrypted_ref:
                    target_ch.encrypted_refresh_token = encrypted_ref
                if channels_found:
                    info = channels_found[0]
                    target_ch.youtube_channel_id = info.get("youtube_channel_id")
                    if not target_ch.title or target_ch.title == "New Channel":
                        target_ch.title = info.get("title")
                    target_ch.thumbnail_url = info.get("thumbnail_url")
                    target_ch.custom_url = info.get("custom_url")
                db.commit()
                return RedirectResponse(url=f"{frontend_base}/channels?auth=success")

        # Otherwise create or update channels found under this Google account
        for info in channels_found:
            yt_id = info.get("youtube_channel_id")
            existing = db.query(Channel).filter(Channel.youtube_channel_id == yt_id).first()
            if existing:
                if encrypted_ref:
                    existing.encrypted_refresh_token = encrypted_ref
                existing.thumbnail_url = info.get("thumbnail_url")
            else:
                new_ch = Channel(
                    youtube_channel_id=yt_id,
                    title=info.get("title") or "YouTube Channel",
                    custom_url=info.get("custom_url"),
                    description=info.get("description"),
                    thumbnail_url=info.get("thumbnail_url"),
                    encrypted_refresh_token=encrypted_ref,
                    category="Technology",
                    video_type_preference="shorts",
                    auto_publish_enabled=False
                )
                db.add(new_ch)
        db.commit()

        return RedirectResponse(url=f"{frontend_base}/channels?auth=success")

    except Exception as e:
        logger.error(f"OAuth callback failed: {e}", exc_info=True)
        return RedirectResponse(url=f"{frontend_base}/channels?auth=error&message={str(e)}")

@router.post("/disconnect/{channel_id}", dependencies=[Depends(verify_studio_access)])
def disconnect_channel_oauth(channel_id: str, db: Session = Depends(get_db)):
    ch = db.query(Channel).filter(Channel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    ch.encrypted_refresh_token = None
    ch.auto_publish_enabled = False
    db.commit()
    return {"message": "Channel disconnected successfully and tokens revoked."}
