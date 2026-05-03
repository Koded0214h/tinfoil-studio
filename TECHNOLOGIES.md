# Tinfoil Studio — Technologies & Features

## AI / Generation

| Feature | Service | Status |
|---|---|---|
| AI image generation from text prompt | Pollinations (`zimage` model) | ✅ Built |
| 3D model from generated image | Tripo3D (`image_to_model`) | ✅ Built |
| AI video generation from image + motion prompt | Pollinations (`wan` model) | ✅ Built |
| Typewriter placeholder prompts | Custom hook | ✅ Built |
| Reference image input (user uploads a frame) | Cloudinary + multipart | ✅ Built |

---

## Pipeline & Jobs

| Feature | Notes | Status |
|---|---|---|
| Background job queue | FastAPI BackgroundTasks | ✅ Built |
| Pipeline stage tracking | `PENDING → IMAGE → 3D → VIDEO → READY → POSTED` | ✅ Built |
| Real-time polling on frontend | `useJobPoll` hook | ✅ Built |
| Job history / list | `GET /api/jobs` | ✅ Built |
| Error handling per stage | `FAILED` status + error message | ✅ Built |
| Resume posting without re-generating | Re-post from `VIDEO_READY` or `POSTED` | ✅ Built |

---

## Storage

| Feature | Service | Status |
|---|---|---|
| Image CDN storage | Cloudinary | ✅ Built |
| 3D model (.glb) storage | Cloudinary | ✅ Built |
| Video storage | Cloudinary | ✅ Built |
| Database | Neon (serverless Postgres) | ✅ Built |

---

## Social Posting

| Feature | Service | Status |
|---|---|---|
| Post to Instagram | Upload-Post API | ✅ Built |
| Post to TikTok | Upload-Post API | ✅ Built |
| Post to YouTube | Upload-Post API | ⚠️ Wired, untested |
| Post to multiple platforms at once | Sequential via modal | ✅ Built |
| Re-posting same video | No re-generation needed | ✅ Built |
| Scheduled posting | Upload-Post (`scheduled_date`) | 🔲 Not wired yet |

---

## Frontend UI

| Feature | Notes | Status |
|---|---|---|
| Brief/prompt box with typewriter | `PromptBox` component | ✅ Built |
| Duration selector (5s / 10s / 15s) | Segmented control | ✅ Built |
| Platform selector (IG / TikTok / YT) | Brand icon picker | ✅ Built |
| Reference image upload + preview | Drag, paste, or click | ✅ Built |
| Live pipeline panels (Image / 3D / Video) | Real-time status | ✅ Built |
| 3D model viewer (GLB in browser) | `@google/model-viewer` | ✅ Built |
| Post workflow modal (Claude-thinking style) | Animated log lines per platform | ✅ Built |
| CPU architecture loading animation | Custom SVG + CSS offset-path | ✅ Built |
| Job status page (`/jobs/:id`) | Full pipeline view | ✅ Built |
| SPA routing (reload works on all routes) | `vercel.json` rewrites | ✅ Built |
| Navbar + Footer | — | ✅ Built |

---

## Infrastructure

| Feature | Notes | Status |
|---|---|---|
| FastAPI backend | Deployed on Render | ✅ Built |
| Frontend | Deployable to Vercel | ✅ Built |
| Neon serverless Postgres | Cold-start tolerant config | ✅ Built |
| Alembic migrations | Schema versioning | ✅ Built |
| CORS configured | Frontend ↔ Backend | ✅ Built |

---

## Possible Additions (Upsell / Future Tiers)

| Feature | Service |
|---|---|
| Scheduled posting (date/time picker) | Upload-Post `scheduled_date` |
| Queue system (auto-schedule next slot) | Upload-Post Queue API |
| Post analytics & performance | Upload-Post Profiles & Analytics |
| More platforms: LinkedIn, Facebook, Pinterest, Bluesky, Reddit, X/Twitter | Upload-Post API |
| Multiple avatars (beyond Vera) | Tripo3D + Pollinations |
| Custom caption & hashtag templates per platform | Internal |
| Webhook callbacks when async posts complete | Upload-Post Webhooks |
| Usage limits / credits system per user | Internal |
