from typing import Dict, Any, Optional
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.config import settings
from app.utils.encryption import encrypt_token, decrypt_token
from app.utils.logger import logger

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/userinfo.profile",
]

class AuthService:
    def get_oauth_flow(self) -> Flow:
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise ValueError("Google Client ID or Client Secret is not configured in .env file.")

        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        }
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
        )
        return flow

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        flow = self.get_oauth_flow()
        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
            state=state,
        )
        return authorization_url

    def exchange_code_for_credentials(self, code: str) -> Dict[str, Any]:
        flow = self.get_oauth_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Fetch channel profile information
        youtube = build("youtube", "v3", credentials=credentials)
        response = youtube.channels().list(
            part="snippet,contentDetails,statistics",
            mine=True
        ).execute()

        channels_data = []
        for item in response.get("items", []):
            snippet = item.get("snippet", {})
            channels_data.append({
                "youtube_channel_id": item.get("id"),
                "title": snippet.get("title"),
                "custom_url": snippet.get("customUrl"),
                "description": snippet.get("description"),
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url") or snippet.get("thumbnails", {}).get("default", {}).get("url"),
            })

        return {
            "refresh_token": credentials.refresh_token,
            "access_token": credentials.token,
            "expiry": credentials.expiry,
            "channels": channels_data,
        }

    def get_authenticated_service(self, encrypted_refresh_token: str):
        raw_refresh = decrypt_token(encrypted_refresh_token)
        if not raw_refresh:
            raise ValueError("Invalid or unreadable encrypted refresh token.")

        credentials = Credentials(
            token=None,
            refresh_token=raw_refresh,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=SCOPES,
        )
        return build("youtube", "v3", credentials=credentials)

auth_service = AuthService()

