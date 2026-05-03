import os
import asyncio
import cloudinary
import cloudinary.uploader
from app.config import get_settings

_configured = False


def _configure():
    global _configured
    if _configured:
        return
    settings = get_settings()
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    _configured = True


async def upload_file(local_path: str, resource_type: str = "auto", folder: str = "tinfoil-studio") -> str:
    """Upload local file to Cloudinary, delete local copy, return CDN URL."""
    _configure()
    result = await asyncio.to_thread(
        cloudinary.uploader.upload,
        local_path,
        resource_type=resource_type,
        folder=folder,
    )
    try:
        os.remove(local_path)
    except OSError:
        pass
    return result["secure_url"]
