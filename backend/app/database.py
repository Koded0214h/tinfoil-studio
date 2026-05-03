import logging
import socket
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


def _pg_host_reachable(url: str) -> bool:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url.replace("+asyncpg", ""))
        host = parsed.hostname or "localhost"
        socket.getaddrinfo(host, None)
        return True
    except socket.gaierror:
        return False


def _make_engine():
    settings = get_settings()
    url = settings.database_url
    # Ensure async drivers — coerce sync scheme variants to async equivalents
    url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    url = url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)

    if url.startswith("sqlite"):
        return create_async_engine(
            url,
            echo=False,
            connect_args={"check_same_thread": False},
        )

    if not _pg_host_reachable(url):
        fallback = "sqlite+aiosqlite:///./tinfoil.db"
        logger.warning(f"PostgreSQL host unreachable — falling back to SQLite ({fallback})")
        return create_async_engine(
            fallback,
            echo=False,
            connect_args={"check_same_thread": False},
        )

    # PostgreSQL — Neon serverless needs a generous connect timeout for cold-start
    # and a small pool (Neon free tier caps at 5 concurrent connections)
    return create_async_engine(
        url,
        echo=False,
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=3,
        pool_recycle=300,      # recycle before Neon's 5-min idle disconnect
        pool_timeout=60,       # wait up to 60s for a pool slot
        connect_args={
            "timeout": 30,     # asyncpg connect timeout — covers Neon cold-start
            "command_timeout": 60,
        },
    )


engine = _make_engine()
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
