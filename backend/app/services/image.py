import os
import uuid
import httpx
import aiofiles
from urllib.parse import quote
from openai import AsyncOpenAI
from app.config import get_settings
from app.services import storage as storage_svc

_client: AsyncOpenAI | None = None

POLLINATIONS_BASE = "https://gen.pollinations.ai"


def _get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=get_settings().openai_api_key)
    return _client


async def generate_image(prompt: str, visual_prompt_prefix: str) -> str:
    """Generate image, returning a local/storage path.

    Routes to Pollinations when POLLINATIONS=true in .env, otherwise DALL-E 3.
    """
    settings = get_settings()
    if settings.pollinations:
        return await _generate_pollinations(prompt, visual_prompt_prefix, settings)
    return await _generate_dalle(prompt, visual_prompt_prefix)


# ── Pollinations ──────────────────────────────────────────────────────────────

async def _generate_pollinations(prompt: str, visual_prompt_prefix: str, settings) -> str:
    full_prompt = visual_prompt_prefix + prompt
    encoded = quote(full_prompt)
    url = f"{POLLINATIONS_BASE}/image/{encoded}?model=zimage&width=1024&height=1024"

    headers = {}
    if settings.pollinations_api_key:
        headers["Authorization"] = f"Bearer {settings.pollinations_api_key}"

    local_path = await _download_file(url, suffix=".jpg", headers=headers)
    return await storage_svc.upload_file(local_path, resource_type="image")


# ── DALL-E 3 ─────────────────────────────────────────────────────────────────

async def _generate_dalle(prompt: str, visual_prompt_prefix: str) -> str:
    full_prompt = visual_prompt_prefix + prompt
    client = _get_openai_client()
    response = await client.images.generate(
        model="dall-e-3",
        prompt=full_prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )
    image_url = response.data[0].url
    local_path = await _download_file(image_url, suffix=".png")
    return await storage_svc.upload_file(local_path, resource_type="image")


# ── Shared ────────────────────────────────────────────────────────────────────

async def _download_file(url: str, suffix: str = "", headers: dict | None = None) -> str:
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)
    filename = f"{uuid.uuid4()}{suffix}"
    dest = os.path.join(settings.storage_path, filename)

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream("GET", url, headers=headers or {}) as resp:
            resp.raise_for_status()
            async with aiofiles.open(dest, "wb") as f:
                async for chunk in resp.aiter_bytes(8192):
                    await f.write(chunk)
    return dest
