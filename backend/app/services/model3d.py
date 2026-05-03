import asyncio
import os
import uuid
import httpx
import aiofiles
from app.config import get_settings

TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi"
POLL_INTERVAL = 10
MAX_WAIT = 600  # 10 min


async def generate_3d_model(image_url: str) -> tuple[str, str]:
    """Submit image to Tripo3D, poll until done, return (task_id, local_glb_path)."""
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {settings.tripo_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{TRIPO_BASE}/task",
            headers=headers,
            json={
                "type": "image_to_model",
                "model_version": "v2.5-20250123",
                "file": {"type": "jpg", "url": image_url},
                "pbr": True,
                "texture": True,
                "texture_quality": "standard",
            },
        )
        resp.raise_for_status()
        task_id = resp.json()["data"]["task_id"]

    glb_url = await _poll_task(task_id, headers)
    local_path = await _download_file(glb_url, suffix=".glb")
    return task_id, local_path


async def _poll_task(task_id: str, headers: dict) -> str:
    elapsed = 0
    async with httpx.AsyncClient(timeout=30) as client:
        while elapsed < MAX_WAIT:
            await asyncio.sleep(POLL_INTERVAL)
            elapsed += POLL_INTERVAL
            resp = await client.get(f"{TRIPO_BASE}/task/{task_id}", headers=headers)
            resp.raise_for_status()
            data = resp.json()["data"]
            status = data.get("status", "queued")

            if status == "success":
                output = data.get("output", {})
                model_url = output.get("pbr_model") or output.get("model")
                if not model_url:
                    raise RuntimeError(f"Tripo3D task {task_id} succeeded but no model URL in output")
                return model_url

            if status == "failed":
                raise RuntimeError(f"Tripo3D task {task_id} failed: {data}")

    raise TimeoutError(f"Tripo3D task {task_id} timed out after {MAX_WAIT}s")


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
