"""Orchestrates the full generation pipeline as a FastAPI BackgroundTask."""
import logging
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job import Job
from app.models.avatar import Avatar
from app.services import image as image_svc
from app.services import video as video_svc
from app.services import model3d as model3d_svc
from app.config import get_settings

logger = logging.getLogger(__name__)


async def run_pipeline(job_id: str, db: AsyncSession) -> None:
    """Full pipeline: image → (optional 3D) → video. Updates job status throughout."""
    settings = get_settings()

    async def _update(status: str, **kwargs):
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            job.status = status
            for k, v in kwargs.items():
                setattr(job, k, v)
            await db.commit()

    try:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        av_result = await db.execute(select(Avatar).where(Avatar.avatar_id == job.avatar_id))
        avatar = av_result.scalar_one_or_none()
        visual_prefix = avatar.visual_prompt if avatar else ""
        motion_prefix = avatar.motion_prompt if avatar else ""

        # --- Step 1: Image generation ---
        await _update("GENERATING_IMAGE")
        prompt = job.prompt or "portrait, studio lighting"

        if job.input_image_url:
            image_path = job.input_image_url
        else:
            image_path = await image_svc.generate_image(prompt, visual_prefix)

        image_url = _to_url(image_path)
        await _update("GENERATING_IMAGE", generated_image_url=image_url)
        logger.info(f"[{job_id}] Image ready: {image_url}")

        # --- Step 2: 3D model (optional) ---
        video_input_url = image_url
        if job.use_3d:
            await _update("GENERATING_3D")
            task_id, glb_path = await model3d_svc.generate_3d_model(image_url)
            glb_url = _to_url(glb_path)
            await _update("GENERATING_3D", model_3d_url=glb_url, model_3d_task_id=task_id)
            logger.info(f"[{job_id}] 3D model ready: {glb_url}")
            # GLB isn't directly usable as video input, keep using the generated image

        # --- Step 3: Video generation ---
        await _update("GENERATING_VIDEO")
        video_path = await video_svc.generate_video(
            image_url=video_input_url,
            motion_prompt=motion_prefix,
            user_prompt=prompt,
            duration=job.duration_seconds,
        )
        video_url = _to_url(video_path)
        await _update("VIDEO_READY", video_url=video_url)
        logger.info(f"[{job_id}] Video ready: {video_url}")

    except Exception as exc:
        logger.exception(f"Pipeline failed for job {job_id}: {exc}")
        await _update("FAILED", error_message=str(exc))


def _to_url(path: str) -> str:
    """Convert a local storage path to a relative URL path."""
    settings = get_settings()
    storage = os.path.abspath(settings.storage_path)
    abs_path = os.path.abspath(path)
    if abs_path.startswith(storage):
        rel = abs_path[len(storage):].lstrip("/")
        return f"/storage/{rel}"
    return path
