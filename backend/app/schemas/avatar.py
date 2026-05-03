from pydantic import BaseModel


class AvatarConfig(BaseModel):
    avatar_id: str
    visual_prompt: str
    motion_prompt: str
    caption_template: str
    hashtag_set: dict[str, str]

    class Config:
        from_attributes = True


class AvatarUpdate(BaseModel):
    visual_prompt: str | None = None
    motion_prompt: str | None = None
    caption_template: str | None = None
    hashtag_set: dict[str, str] | None = None
