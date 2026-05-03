import asyncio
import os
import time
import uuid
import httpx
import aiofiles
from urllib.parse import quote
from app.config import get_settings
from app.services import storage as storage_svc

ARK_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3"
ARK_MODEL = "seedance-1-0-pro-250528"
ARK_POLL_INTERVAL = 30
ARK_MAX_WAIT = 900

POLLINATIONS_BASE = "https://gen.pollinations.ai"
POLLINATIONS_VIDEO_MODEL = "wan"


async def generate_video(
    image_url: str,
    motion_prompt: str,
    user_prompt: str,
    duration: int = 6,
    resolution: str = "1080p",
) -> str:
    settings = get_settings()
    if settings.pollinations:
        return await _generate_pollinations(image_url, motion_prompt, user_prompt, duration, settings)
    return await _generate_ark(image_url, motion_prompt, user_prompt, duration, resolution)


# ── Pollinations ──────────────────────────────────────────────────────────────

async def _generate_pollinations(
    image_url: str,
    motion_prompt: str,
    user_prompt: str,
    duration: int,
    settings,
) -> str:
    full_prompt = motion_prompt + user_prompt
    encoded_prompt = quote(full_prompt)
    duration_val = max(2, min(10, duration))

    url = (
        f"{POLLINATIONS_BASE}/video/{encoded_prompt}"
        f"?model={POLLINATIONS_VIDEO_MODEL}&duration={duration_val}&aspectRatio=9:16"
        f"&image={quote(image_url, safe='')}"
    )

    headers = {}
    if settings.pollinations_api_key:
        headers["Authorization"] = f"Bearer {settings.pollinations_api_key}"

    local_path = await _download_file(url, suffix=".mp4", headers=headers, timeout=600.0)
    return await storage_svc.upload_file(local_path, resource_type="video")


# ── BytePlus ARK / Seedance ───────────────────────────────────────────────────

async def _generate_ark(
    image_url: str,
    motion_prompt: str,
    user_prompt: str,
    duration: int,
    resolution: str,
) -> str:
    full_prompt = motion_prompt + user_prompt
    duration_val = duration if 2 <= duration <= 12 else 10
    video_url = await asyncio.to_thread(
        _ark_submit_and_poll,
        full_prompt,
        image_url,
        duration_val,
        resolution,
    )
    local_path = await _download_file(video_url, suffix=".mp4")
    return await storage_svc.upload_file(local_path, resource_type="video")


def _ark_submit_and_poll(prompt: str, image_url: str, duration: int, resolution: str) -> str:
    from byteplussdkarkruntime import Ark

    settings = get_settings()
    client = Ark(base_url=ARK_BASE_URL, api_key=settings.ark_api_key)

    create_result = client.content_generation.tasks.create(
        model=ARK_MODEL,
        content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": image_url}, "role": "first_frame"},
        ],
        ratio="9:16",
        resolution=resolution,
        duration=duration,
        watermark=False,
    )

    task_id = create_result.id
    elapsed = 0
    while elapsed < ARK_MAX_WAIT:
        time.sleep(ARK_POLL_INTERVAL)
        elapsed += ARK_POLL_INTERVAL
        result = client.content_generation.tasks.get(task_id=task_id)
        if result.status == "succeeded":
            return result.content.video_url
        if result.status in ("failed", "expired"):
            raise RuntimeError(f"Seedance task {task_id} {result.status}: {result.error}")

    raise TimeoutError(f"Seedance task {task_id} timed out after {ARK_MAX_WAIT}s")


# ── Shared ────────────────────────────────────────────────────────────────────

async def _download_file(url: str, suffix: str = "", headers: dict | None = None, timeout: float = 120.0) -> str:
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)
    filename = f"{uuid.uuid4()}{suffix}"
    dest = os.path.join(settings.storage_path, filename)

    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("GET", url, headers=headers or {}) as resp:
            resp.raise_for_status()
            async with aiofiles.open(dest, "wb") as f:
                async for chunk in resp.aiter_bytes(65536):
                    await f.write(chunk)
    return dest
