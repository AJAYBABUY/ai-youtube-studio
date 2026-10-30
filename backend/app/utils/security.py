import os
import hmac
import secrets
from pathlib import Path
from fastapi import Request, HTTPException, Security, status
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.config import settings, BASE_DIR

KEY_FILE = BASE_DIR / "data" / ".access_key"
api_key_header = APIKeyHeader(name="X-Studio-Key", auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)

def get_or_create_access_key() -> str:
    """Returns the persistent studio access key, creating one if not present."""
    if settings.STUDIO_ACCESS_KEY and settings.STUDIO_ACCESS_KEY.strip():
        return settings.STUDIO_ACCESS_KEY.strip()

    if KEY_FILE.exists():
        with open(KEY_FILE, "r", encoding="utf-8") as f:
            saved_key = f.read().strip()
            if saved_key:
                settings.STUDIO_ACCESS_KEY = saved_key
                return saved_key

    # Generate a new 32-character secure hex token
    new_key = secrets.token_hex(16)
    KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(KEY_FILE, "w", encoding="utf-8") as f:
        f.write(new_key)
    settings.STUDIO_ACCESS_KEY = new_key
    return new_key

def verify_studio_access(
    request: Request,
    header_key: Optional[str] = Security(api_key_header),
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme)
) -> bool:
    """
    Validates that the incoming request has a valid Studio Access Key.
    Accepts:
    1. Header: X-Studio-Key
    2. Header: Authorization: Bearer <key>
    3. Query param: ?key=<key> or ?studio_key=<key>
    """
    expected_key = get_or_create_access_key()
    
    # 1. Check X-Studio-Key header
    provided_key = header_key

    # 2. Check Bearer token
    if not provided_key and bearer_creds:
        provided_key = bearer_creds.credentials

    # 3. Check query param (for streaming media/thumbnails)
    if not provided_key:
        provided_key = request.query_params.get("studio_key") or request.query_params.get("key")

    if not provided_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Studio Access Key required. Please provide X-Studio-Key header or authenticate in the web interface.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not hmac.compare_digest(provided_key.strip(), expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Studio Access Key. Access denied.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return True

def validate_access_key_plain(key: str) -> bool:
    """Helper to check if a string matches the current studio access key."""
    if not key:
        return False
    expected_key = get_or_create_access_key()
    return hmac.compare_digest(key.strip(), expected_key)
