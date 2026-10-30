import os
from typing import Dict, Any, Optional
from datetime import datetime
from googleapiclient.http import MediaFileUpload
from app.services.auth_service import auth_service
from app.utils.logger import logger

CATEGORY_MAP = {
    "Technology": "28", # Science & Technology
    "Science": "28",
    "Education": "27",  # Education
    "History": "27",
    "Serious Facts": "27",
    "Kids Stories": "1", # Film & Animation / Education
    "Entertainment": "24", # Entertainment
    "Current Affairs": "25", # News & Politics
    "General Knowledge": "27",
}

class YouTubeService:
    def upload_video(
        self,
        encrypted_refresh_token: str,
        video_path: str,
        title: str,
        description: str,
        tags: str,
        category: str = "Technology",
        privacy_status: str = "public",
        scheduled_publish_time: Optional[datetime] = None,
        thumbnail_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Uploads a video to YouTube using the official YouTube Data API v3 resumable upload protocol.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        youtube = auth_service.get_authenticated_service(encrypted_refresh_token)

        category_id = CATEGORY_MAP.get(category, "28")
        tags_list = [t.strip() for t in tags.split(",") if t.strip()]

        body = {
            "snippet": {
                "title": title[:100], # YouTube max title length is 100 characters
                "description": description[:5000],
                "tags": tags_list,
                "categoryId": category_id,
                "defaultLanguage": "te",
                "defaultAudioLanguage": "te"
            },
            "status": {
                "privacyStatus": "private" if scheduled_publish_time else privacy_status,
                "selfDeclaredMadeForKids": category == "Kids Stories"
            }
        }

        # Add scheduled publication if specified
        if scheduled_publish_time:
            body["status"]["publishAt"] = scheduled_publish_time.isoformat() + "Z"
            body["status"]["privacyStatus"] = "private" # Must be private when scheduled

        media = MediaFileUpload(
            video_path,
            chunksize=1024 * 1024 * 2, # 2MB chunks
            resumable=True,
            mimetype="video/mp4"
        )

        request = youtube.videos().insert(
            part=",".join(body.keys()),
            body=body,
            media_body=media
        )

        logger.info(f"Initiating resumable upload for: '{title}' ({video_path})")
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info(f"Uploaded {int(status.progress() * 100)}% of {video_path}")

        video_id = response.get("id")
        video_url = f"https://youtu.be/{video_id}"
        logger.info(f"Video upload confirmed! Video ID: {video_id}, URL: {video_url}")

        # Upload custom thumbnail if provided
        if thumbnail_path and os.path.exists(thumbnail_path) and video_id:
            try:
                thumb_media = MediaFileUpload(thumbnail_path, mimetype="image/jpeg")
                youtube.thumbnails().set(
                    videoId=video_id,
                    media_body=thumb_media
                ).execute()
                logger.info(f"Uploaded custom thumbnail for {video_id}")
            except Exception as e:
                logger.warning(f"Could not upload custom thumbnail for {video_id}: {e}")

        return {
            "video_id": video_id,
            "video_url": video_url,
            "privacy_status": body["status"]["privacyStatus"],
            "published_at": datetime.utcnow() if not scheduled_publish_time else None,
            "scheduled_at": scheduled_publish_time,
        }

youtube_service = YouTubeService()

