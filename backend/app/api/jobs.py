import uuid
import os
import aiofiles
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse, JobListResponse, JobPostRequest
from app.services import pipeline as pipeline_svc
from app.services import posting as posting_svc
from app.services import storage as storage_svc
from app.models.avatar import Avatar
from app.config import get_settings

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(
    background_tasks: BackgroundTasks,
    prompt: str | None = Form(default=None),
    avatar_id: str = Form(default="vera"),
    duration: int = Form(default=10),
    use_3d: bool = Form(default=False),
    platform: str = Form(default="instagram"),
    input_image: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
):
    input_image_url = None
    if input_image:
        input_image_url = await _save_upload(input_image)

    job = Job(
        id=str(uuid.uuid4()),
        avatar_id=avatar_id,
        prompt=prompt,
        input_image_url=input_image_url,
        platform=platform,
        duration_seconds=duration,
        use_3d=use_3d,
        status="PENDING",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(_run_pipeline_task, job.id)
    return job


@router.get("", response_model=JobListResponse)
async def list_jobs(
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    q = select(Job)
    count_q = select(func.count()).select_from(Job)
    if status:
        q = q.where(Job.status == status)
        count_q = count_q.where(Job.status == status)

    q = q.order_by(Job.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    jobs = result.scalars().all()

    total_result = await db.execute(count_q)
    total = total_result.scalar_one()

    return JobListResponse(jobs=list(jobs), total=total, limit=limit, offset=offset)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


class PublishRequest(BaseModel):
    platform: str


@router.post("/{job_id}/publish")
async def publish_job(
    job_id: str,
    body: PublishRequest,
    db: AsyncSession = Depends(get_db),
):
    """Post to a single platform. Returns {success, url, error}."""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.video_url:
        raise HTTPException(status_code=400, detail="No video URL on job")

    avatar_result = await db.execute(select(Avatar).where(Avatar.avatar_id == job.avatar_id))
    avatar = avatar_result.scalar_one_or_none()
    title = job.prompt or "Vera content"

    result_data = await posting_svc.post_to_platform(
        video_url=job.video_url,
        platform=body.platform,
        title=title,
    )

    if result_data.get("success"):
        job.post_url = result_data.get("url") or job.post_url
        job.status = "POSTED"
        await db.commit()

    return result_data


@router.post("/{job_id}/post", response_model=JobResponse)
async def post_job(
    job_id: str,
    body: JobPostRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "VIDEO_READY":
        raise HTTPException(status_code=400, detail=f"Job is not VIDEO_READY (current: {job.status})")
    if not job.video_url:
        raise HTTPException(status_code=400, detail="No video URL on job")

    platform = body.platform or job.platform
    avatar_result = await db.execute(
        select(Avatar).where(Avatar.avatar_id == job.avatar_id)
    )
    avatar = avatar_result.scalar_one_or_none()
    caption = _build_caption(avatar, job.prompt or "", platform)

    video_public_url = _ensure_public_url(job.video_url)

    try:
        result_data = await posting_svc.post_to_platform(
            video_url=video_public_url,
            platform=platform,
            title=caption,
        )
        job.post_url = result_data.get("url") or ""
        job.status = "POSTED"
        await db.commit()
        await db.refresh(job)
    except Exception as exc:
        job.status = "FAILED"
        job.error_message = str(exc)
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc))

    return job


async def _save_upload(upload: UploadFile) -> str:
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)
    ext = os.path.splitext(upload.filename or "")[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    dest = os.path.join(settings.storage_path, filename)
    content = await upload.read()
    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)
    return await storage_svc.upload_file(dest, resource_type="image")


async def _run_pipeline_task(job_id: str):
    await pipeline_svc.run_pipeline(job_id)


def _build_caption(avatar, prompt: str, platform: str) -> str:
    if not avatar:
        return prompt
    hashtags = avatar.hashtag_set.get(platform, "") if avatar.hashtag_set else ""
    template = avatar.caption_template or "{topic}\n\n{hashtags}"
    return template.format(topic=prompt, hashtags=hashtags)


def _ensure_public_url(url: str) -> str:
    if url.startswith("http"):
        return url
    settings = get_settings()
    base = os.environ.get("PUBLIC_BASE_URL", "http://localhost:8000")
    return f"{base}{url}"
