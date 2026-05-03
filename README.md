---
name: Tinfoil Studio Backend
description: FastAPI backend for Tinfoil Studio AI video pipeline — services, routes, DB, and social posting
type: project
---

## Tinfoil Studio

Full-stack AI video pipeline called **Tinfoil Studio** featuring avatar "Vera".

**Why:** Being built to land a client gig — production quality matters.

**How to apply:** Prioritize polish, correctness, and real API integrations over shortcuts.

## Stack
- **Backend**: FastAPI + async SQLAlchemy + Neon (serverless Postgres) + Alembic
- **Frontend**: React 19 + Vite + Tailwind + Framer Motion + Radix UI
- **Pipeline**: Pollinations (image: `zimage` model, video: `wan` model) → Tripo3D (image-to-3D GLB) → Cloudinary (storage)
- **Posting**: Upload-Post API (`POST /api/upload`, `Apikey` header, `user` = Upload-Post profile name NOT social handle)

## Pipeline stages
`PENDING → GENERATING_IMAGE → GENERATING_3D → GENERATING_VIDEO → VIDEO_READY → POSTED`

3D always runs (not optional). Fresh DB session per pipeline update to survive Neon idle timeouts.

## Key config (.env)
- `POLLINATIONS=true` to use Pollinations for video (vs ARK fallback)
- `INSTAGRAM_USER` / `TIKTOK_USER` = Upload-Post **profile name** (not social handle)
- Neon DB needs `connect_args={"timeout": 30}` and small pool (`pool_size=2`) for cold-start tolerance

## Frontend pages
- `/prompt` — main brief/generation page with job polling and PostWorkflowModal
- `/jobs/:id` — job status page with CpuArchitecture loader and PostWorkflowModal

## Posting quirks
- Upload-Post may return async response (no `results` key) when Instagram takes >59s — treat as success
- `/api/jobs/{id}/publish` is the correct endpoint (no status check); old `/post` endpoint is legacy
- Post button shows for both `VIDEO_READY` and `POSTED` status (re-posting allowed)
