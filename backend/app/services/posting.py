import httpx
from app.config import get_settings

UPLOAD_POST_BASE = "https://api.upload-post.com/api"


async def post_to_platform(video_url: str, platform: str, title: str) -> dict:
    """Post video to one platform via Upload-Post. Returns {success, url, error}."""
    settings = get_settings()
    headers = {"Authorization": f"Apikey {settings.upload_post_api_key}"}

    user = _get_user(platform, settings)
    data = {
        "user": user,
        "platform[]": platform,
        "video": video_url,
        "title": title,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(f"{UPLOAD_POST_BASE}/upload", headers=headers, data=data)
        result = resp.json()

    if not result.get("success"):
        return {"success": False, "url": None, "error": result.get("message", "Upload failed")}

    # Async/background response — Upload-Post accepted but is processing in background
    if "results" not in result:
        return {
            "success": True,
            "url": None,
            "error": None,
            "async": True,
            "request_id": result.get("request_id"),
        }

    platform_result = result.get("results", {}).get(platform, {})
    return {
        "success": platform_result.get("success", True),
        "url": platform_result.get("url") or platform_result.get("post_url"),
        "error": platform_result.get("error"),
    }


def _get_user(platform: str, settings) -> str:
    mapping = {
        "instagram": settings.instagram_user,
        "tiktok": settings.tiktok_user,
        "youtube": settings.instagram_user,
    }
    return mapping.get(platform, settings.instagram_user)
