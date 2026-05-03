import os
import uuid
import httpx
import aiofiles
from openai import AsyncOpenAI
from app.config import get_settings
from app.services import storage as storage_svc

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=get_settings().openai_api_key)
    return _client


async def generate_image(prompt: str, visual_prompt_prefix: str) -> str:
    """Generate image via DALL-E 3, return local file path."""
    settings = get_settings()
    full_prompt = visual_prompt_prefix + prompt

    client = _get_client()
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


async def _download_file(url: str, suffix: str = "") -> str:
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)
    filename = f"{uuid.uuid4()}{suffix}"
    dest = os.path.join(settings.storage_path, filename)

    async with httpx.AsyncClient() as client:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            async with aiofiles.open(dest, "wb") as f:
                async for chunk in resp.aiter_bytes(8192):
                    await f.write(chunk)
    return dest
