"""Orchestrates the full generation pipeline as a FastAPI BackgroundTask."""
import logging
from sqlalchemy import select
from app.models.job import Job
from app.models.avatar import Avatar
from app.services import image as image_svc
from app.services import video as video_svc
from app.services import model3d as model3d_svc
from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)


async def run_pipeline(job_id: str) -> None:
    """Full pipeline: image → 3D model → video. Uses a fresh DB session per update."""

    async def _update(status: str, **kwargs):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Job).where(Job.id == job_id))
            job = result.scalar_one_or_none()
            if job:
                job.status = status
                for k, v in kwargs.items():
                    setattr(job, k, v)
                await db.commit()

    async def _load_job():
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Job).where(Job.id == job_id))
            return result.scalar_one_or_none()

    async def _load_avatar(avatar_id: str):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Avatar).where(Avatar.avatar_id == avatar_id))
            return result.scalar_one_or_none()

    try:
        job = await _load_job()
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        avatar = await _load_avatar(job.avatar_id)
        visual_prefix = avatar.visual_prompt if avatar else ""
        motion_prefix = avatar.motion_prompt if avatar else ""
        prompt = job.prompt or "portrait, studio lighting"
        input_image_url = job.input_image_url
        duration = job.duration_seconds

        # --- Step 1: Image ---
        await _update("GENERATING_IMAGE")
        if input_image_url:
            image_url = input_image_url
        else:
            image_url = await image_svc.generate_image(prompt, visual_prefix)
        await _update("GENERATING_IMAGE", generated_image_url=image_url)
        logger.info(f"[{job_id}] Image ready: {image_url}")

        # --- Step 2: 3D model ---
        await _update("GENERATING_3D")
        task_id, glb_url = await model3d_svc.generate_3d_model(image_url)
        await _update("GENERATING_3D", model_3d_url=glb_url, model_3d_task_id=task_id)
        logger.info(f"[{job_id}] 3D model ready: {glb_url}")

        # --- Step 3: Video ---
        await _update("GENERATING_VIDEO")
        video_url = await video_svc.generate_video(
            image_url=image_url,
            motion_prompt=motion_prefix,
            user_prompt=prompt,
            duration=duration,
        )
        await _update("VIDEO_READY", video_url=video_url)
        logger.info(f"[{job_id}] Video ready: {video_url}")

    except Exception as exc:
        logger.exception(f"Pipeline failed for job {job_id}: {exc}")
        await _update("FAILED", error_message=str(exc))
