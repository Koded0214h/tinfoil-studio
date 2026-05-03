import asyncio
import os
import time
import uuid
import httpx
import aiofiles
from app.config import get_settings

ARK_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3"
ARK_MODEL = "seedance-1-0-pro-250528"
POLL_INTERVAL = 30
MAX_WAIT = 900  # 15 min


async def generate_video(
    image_url: str,
    motion_prompt: str,
    user_prompt: str,
    duration: int = 10,
    resolution: str = "1080p",
) -> str:
    """Submit image to Seedance 1.0 Pro via BytePlus ModelArk, return local video path."""
    full_prompt = motion_prompt + user_prompt
    duration_val = duration if 2 <= duration <= 12 else 10

    video_url = await asyncio.to_thread(
        _submit_and_poll,
        full_prompt,
        image_url,
        duration_val,
        resolution,
    )
    return await _download_file(video_url, suffix=".mp4")


def _submit_and_poll(
    prompt: str,
    image_url: str,
    duration: int,
    resolution: str,
) -> str:
    """Blocking submit + poll — runs in a thread via asyncio.to_thread."""
    from byteplussdkarkruntime import Ark

    settings = get_settings()
    client = Ark(base_url=ARK_BASE_URL, api_key=settings.ark_api_key)

    create_result = client.content_generation.tasks.create(
        model=ARK_MODEL,
        content=[
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {"url": image_url},
                "role": "first_frame",
            },
        ],
        ratio="9:16",
        resolution=resolution,
        duration=duration,
        watermark=False,
    )

    task_id = create_result.id
    elapsed = 0
    while elapsed < MAX_WAIT:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
        result = client.content_generation.tasks.get(task_id=task_id)
        if result.status == "succeeded":
            return result.content.video_url
        if result.status in ("failed", "expired"):
            raise RuntimeError(f"Seedance task {task_id} {result.status}: {result.error}")

    raise TimeoutError(f"Seedance task {task_id} timed out after {MAX_WAIT}s")


async def _download_file(url: str, suffix: str = "") -> str:
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)
    filename = f"{uuid.uuid4()}{suffix}"
    dest = os.path.join(settings.storage_path, filename)

    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            async with aiofiles.open(dest, "wb") as f:
                async for chunk in resp.aiter_bytes(65536):
                    await f.write(chunk)
    return dest
