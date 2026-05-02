from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


JobStatus = Literal[
    "PENDING",
    "GENERATING_IMAGE",
    "GENERATING_3D",
    "GENERATING_VIDEO",
    "VIDEO_READY",
    "POSTED",
    "FAILED",
]

Platform = Literal["instagram", "tiktok", "youtube"]


class JobCreate(BaseModel):
    prompt: str | None = None
    avatar_id: str = "vera"
    duration: int = Field(default=10, ge=2, le=12)
    use_3d: bool = False
    platform: Platform = "instagram"


class JobPostRequest(BaseModel):
    platform: Platform | None = None
    scheduled_at: datetime | None = None


class JobResponse(BaseModel):
    id: str
    avatar_id: str
    prompt: str | None
    input_image_url: str | None
    generated_image_url: str | None
    model_3d_url: str | None
    video_url: str | None
    post_url: str | None
    platform: str
    status: str
    error_message: str | None
    duration_seconds: int
    use_3d: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
    limit: int
    offset: int
