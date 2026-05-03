import httpx
from datetime import datetime
from app.config import get_settings

UPLOAD_POST_BASE = "https://api.upload-post.com/api"


async def post_video(
    video_url: str,
    platform: str,
    caption: str,
    scheduled_at: datetime | None = None,
) -> str:
    """Post video via Upload-Post API. Returns the public post URL."""
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {settings.upload_post_api_key}",
        "Content-Type": "application/json",
    }

    username = _get_username(platform, settings)
    payload: dict = {
        "videoUrl": video_url,
        "platforms": [{"platform": platform, "username": username}],
        "caption": caption,
    }
    if scheduled_at:
        payload["scheduledAt"] = scheduled_at.isoformat()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(f"{UPLOAD_POST_BASE}/posts", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    post_url = (
        data.get("postUrl")
        or data.get("post_url")
        or data.get("url")
        or f"https://{platform}.com/p/pending"
    )
    return post_url


def _get_username(platform: str, settings) -> str:
    mapping = {
        "instagram": settings.instagram_user,
        "tiktok": settings.tiktok_user,
        "youtube": "",
    }
    return mapping.get(platform, "")
