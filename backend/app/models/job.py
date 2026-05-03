import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


def _now():
    return datetime.now(timezone.utc)


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    avatar_id: Mapped[str] = mapped_column(String(64), default="vera")
    prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_3d_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_3d_task_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    video_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    post_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    platform: Mapped[str] = mapped_column(String(32), default="instagram")
    status: Mapped[str] = mapped_column(String(32), default="PENDING")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=10)
    use_3d: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
