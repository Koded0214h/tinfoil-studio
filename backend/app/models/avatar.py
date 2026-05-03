from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Avatar(Base):
    __tablename__ = "avatars"

    avatar_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    visual_prompt: Mapped[str] = mapped_column(Text, default="")
    motion_prompt: Mapped[str] = mapped_column(Text, default="")
    caption_template: Mapped[str] = mapped_column(Text, default="{topic}\n\n{hashtags}")
    hashtag_set: Mapped[dict] = mapped_column(JSON, default=dict)
