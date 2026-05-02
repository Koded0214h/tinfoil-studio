from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.avatar import Avatar
from app.schemas.avatar import AvatarConfig, AvatarUpdate

router = APIRouter(prefix="/api/avatars", tags=["avatars"])


@router.get("/{avatar_id}/config", response_model=AvatarConfig)
async def get_avatar_config(avatar_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Avatar).where(Avatar.avatar_id == avatar_id))
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return avatar


@router.put("/{avatar_id}/config", response_model=AvatarConfig)
async def update_avatar_config(
    avatar_id: str,
    body: AvatarUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Avatar).where(Avatar.avatar_id == avatar_id))
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    if body.visual_prompt is not None:
        avatar.visual_prompt = body.visual_prompt
    if body.motion_prompt is not None:
        avatar.motion_prompt = body.motion_prompt
    if body.caption_template is not None:
        avatar.caption_template = body.caption_template
    if body.hashtag_set is not None:
        avatar.hashtag_set = body.hashtag_set

    await db.commit()
    await db.refresh(avatar)
    return avatar
