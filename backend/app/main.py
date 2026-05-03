import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from app.database import init_db, AsyncSessionLocal
from app.models.avatar import Avatar
from app.api import jobs, avatars
from app.config import get_settings, VERA_DEFAULTS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)
    try:
        await init_db()
        await _seed_vera()
        logger.info("Database ready")
    except Exception as exc:
        logger.warning(f"Database unavailable at startup ({exc}) — retrying on first request")
    yield


async def _seed_vera():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Avatar).where(Avatar.avatar_id == "vera"))
        if result.scalar_one_or_none() is None:
            vera = Avatar(
                avatar_id="vera",
                visual_prompt=VERA_DEFAULTS["visual_prompt"],
                motion_prompt=VERA_DEFAULTS["motion_prompt"],
                caption_template=VERA_DEFAULTS["caption_template"],
                hashtag_set=VERA_DEFAULTS["hashtag_set"],
            )
            db.add(vera)
            await db.commit()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Tinfoil Studio API",
        description="AI Avatar Content Generation & Distribution Pipeline",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(jobs.router)
    app.include_router(avatars.router)

    os.makedirs(settings.storage_path, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=settings.storage_path), name="storage")

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "tinfoil-studio"}

    return app


app = create_app()
