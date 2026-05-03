# Tinfoil Studio — Frontend Design

Stack: React 19, React Router 7, Tailwind CSS 3, Axios

---

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Recent jobs, quick stats, create CTA |
| `/jobs/new` | New Job | Job creation form |
| `/jobs` | Jobs List | All jobs, filter by status |
| `/jobs/:id` | Job Detail | Full job view + post action |
| `/avatar` | Avatar Settings | Edit Vera's prompts, captions, hashtags |

---

## Global Layout

Every page shares a shell with a fixed sidebar and a top bar.

```
┌─────────────────────────────────────────────────────────┐
│  TOP BAR                                                │
│  [≡]  Tinfoil Studio                     [Vera avatar] │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │  PAGE CONTENT                           │
│              │                                          │
│  ● Dashboard │                                          │
│  ● New Job   │                                          │
│  ● Jobs      │                                          │
│  ─────────   │                                          │
│  ● Avatar    │                                          │
│              │                                          │
│              │                                          │
│              │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## Page Layouts

### 1. Dashboard `/`

```
┌─────────────────────────────────────────────────────────┐
│  Good morning, Vera ✦                  [+ New Job]      │
├──────────┬──────────┬──────────┬───────────────────────┤
│ PENDING  │ IN PROG  │  READY   │  POSTED               │
│    2     │    1     │    4     │   28                  │
├──────────┴──────────┴──────────┴───────────────────────┤
│  Recent Jobs                               [View all →] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [thumb]  "Spring fashion lookbook"  VIDEO_READY  ⋮  │ │
│ │ [thumb]  "Neon glow editorial"      POSTED       ⋮  │ │
│ │ [thumb]  "Studio minimalist"        GENERATING…  ⋮  │ │
│ │ [thumb]  "Dark academia vibes"      POSTED       ⋮  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. New Job `/jobs/new`

```
┌─────────────────────────────────────────────────────────┐
│  New Job                                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Prompt                                         │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │  Describe the scene, mood, or theme…      │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  │                                                 │   │
│  │  Avatar        Platform        Duration         │   │
│  │  [Vera ▾]      [Instagram ▾]   [10s ▾]         │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  Upload image  (optional — skip for AI) │   │   │
│  │  │  [  drag & drop or click to browse  ]   │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │  [ ] Generate 3D model                         │   │
│  │                                                 │   │
│  │                      [Cancel]  [Generate ▶]    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3. Jobs List `/jobs`

```
┌─────────────────────────────────────────────────────────┐
│  Jobs                              [All ▾]  [+ New Job] │
├─────────────────────────────────────────────────────────┤
│  [thumb] "Spring fashion lookbook"                      │
│           Instagram · 10s · VIDEO_READY     [Post →]   │
│           May 3, 2026                                   │
├─────────────────────────────────────────────────────────┤
│  [thumb] "Neon glow editorial"                          │
│           TikTok · 7s · POSTED              [View]     │
│           May 2, 2026                                   │
├─────────────────────────────────────────────────────────┤
│  [spinner] "Studio minimalist"                          │
│           Instagram · 10s · GENERATING_IMAGE…          │
│           May 2, 2026                                   │
├─────────────────────────────────────────────────────────┤
│                          ← 1  2  3  →                   │
└─────────────────────────────────────────────────────────┘
```

### 4. Job Detail `/jobs/:id`

```
┌─────────────────────────────────────────────────────────┐
│  ← Jobs   "Spring fashion lookbook"      [Instagram]    │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │                      │  │  Status Timeline         │ │
│  │   Generated Image    │  │                          │ │
│  │   (or video player   │  │  ✓ Image generated       │ │
│  │    when VIDEO_READY) │  │  ✓ Video generated       │ │
│  │                      │  │  ○ Posted                │ │
│  │                      │  │                          │ │
│  │  [Download image]    │  │  Platform:  Instagram    │ │
│  │  [Download video]    │  │  Duration:  10s          │ │
│  │                      │  │  3D model:  No           │ │
│  └──────────────────────┘  │  Created:   May 3, 2026  │ │
│                             │                          │ │
│                             │  ┌─────────────────────┐ │ │
│                             │  │  Post to Instagram   │ │ │
│                             │  │  Schedule (optional) │ │ │
│                             │  │  [Confirm & Post ▶]  │ │ │
│                             │  └─────────────────────┘ │ │
│                             └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 5. Avatar Settings `/avatar`

```
┌─────────────────────────────────────────────────────────┐
│  Avatar Settings — Vera                                 │
│                                                         │
│  Visual Prompt (prepended to every DALL-E 3 generation) │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Vera, a hyper-realistic AI talent, dark studio…  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Motion Prompt (prepended to every Seedance generation) │
│  ┌───────────────────────────────────────────────────┐  │
│  │  smooth cinematic motion, slow push-in…           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Caption Template                                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✨ {topic} ✨\n\n{hashtags}                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Hashtags                                               │
│  [Instagram] [TikTok] [YouTube]   ← tabs               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  #aiavatar #veraai #contentcreator…               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│                                        [Save changes]   │
└─────────────────────────────────────────────────────────┘
```

---

## User Flow

```mermaid
flowchart TD
    A([User opens app]) --> B[Dashboard]

    B --> C[Click + New Job]
    B --> D[Click a job in Recent Jobs]
    B --> E[Click View all]

    C --> F[New Job form]
    F --> G{Image upload?}
    G -- Yes --> H[Upload image]
    G -- No --> I[AI will generate]
    H --> J[Fill prompt, platform, duration]
    I --> J
    J --> K{Enable 3D?}
    K -- Yes --> L[use_3d = true]
    K -- No --> M[use_3d = false]
    L --> N[Submit → POST /api/jobs]
    M --> N

    N --> O[Job created — status: PENDING]
    O --> P[Navigate to Job Detail]

    P --> Q[Poll GET /api/jobs/:id every 3s]
    Q --> R{status?}
    R -- GENERATING_IMAGE --> Q
    R -- GENERATING_3D --> Q
    R -- GENERATING_VIDEO --> Q
    R -- FAILED --> S[Show error message]
    R -- VIDEO_READY --> T[Show video player + Post button]

    T --> U{User action}
    U -- Post now --> V[Select platform, confirm]
    U -- Schedule --> W[Pick datetime, confirm]
    V --> X[POST /api/jobs/:id/post]
    W --> X
    X --> Y[status: POSTED]
    Y --> Z[Show post URL / success]

    E --> AA[Jobs List]
    AA --> D
    D --> P
```

---

## Job Status State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : Job created

    PENDING --> GENERATING_IMAGE : Pipeline starts
    GENERATING_IMAGE --> GENERATING_3D : Image ready\n(use_3d = true)
    GENERATING_IMAGE --> GENERATING_VIDEO : Image ready\n(use_3d = false)
    GENERATING_3D --> GENERATING_VIDEO : 3D model ready
    GENERATING_VIDEO --> VIDEO_READY : Video ready on Cloudinary
    VIDEO_READY --> POSTED : User posts to platform

    GENERATING_IMAGE --> FAILED : Error
    GENERATING_3D --> FAILED : Error
    GENERATING_VIDEO --> FAILED : Error
    VIDEO_READY --> FAILED : Post failed
```

---

## Component Tree

```mermaid
graph TD
    App --> Shell
    Shell --> Sidebar
    Shell --> TopBar
    Shell --> RouterOutlet

    RouterOutlet --> Dashboard
    RouterOutlet --> NewJobPage
    RouterOutlet --> JobsListPage
    RouterOutlet --> JobDetailPage
    RouterOutlet --> AvatarPage

    Dashboard --> StatCards
    Dashboard --> RecentJobsList
    RecentJobsList --> JobRow

    NewJobPage --> JobForm
    JobForm --> ImageDropzone
    JobForm --> PlatformSelect
    JobForm --> AvatarSelect

    JobsListPage --> StatusFilter
    JobsListPage --> JobTable
    JobTable --> JobRow

    JobDetailPage --> MediaViewer
    JobDetailPage --> StatusTimeline
    JobDetailPage --> PostPanel
    PostPanel --> PlatformConfirm
    PostPanel --> SchedulePicker

    AvatarPage --> PromptEditor
    AvatarPage --> HashtagTabs
```

---

## API Integration Map

| Page / Action | Method | Endpoint |
|---|---|---|
| Dashboard — load recent | GET | `/api/jobs?limit=5` |
| Jobs List — load all | GET | `/api/jobs?status=X&limit=20&offset=N` |
| Job Detail — load | GET | `/api/jobs/:id` |
| Job Detail — poll status | GET | `/api/jobs/:id` (every 3s) |
| New Job — submit | POST | `/api/jobs` (multipart) |
| Post action | POST | `/api/jobs/:id/post` |
| Avatar — load config | GET | `/api/avatars/vera/config` |
| Avatar — save config | PUT | `/api/avatars/vera/config` |

---

## Polling Strategy

- Start polling on Job Detail mount when status is not terminal
- Poll interval: **3 seconds**
- Stop polling when status is `VIDEO_READY`, `POSTED`, or `FAILED`
- Show animated status indicator per stage (pulse on active, check on done, X on failed)

---

## Key UI States

| State | What the user sees |
|---|---|
| Job creating | Spinner, "Setting up your job…" |
| GENERATING_IMAGE | Step 1 active — "Creating your image with DALL-E 3" |
| GENERATING_3D | Step 2 active — "Building 3D model with Tripo3D" |
| GENERATING_VIDEO | Step 3 active — "Rendering video with Seedance" |
| VIDEO_READY | Video player shown, Post button enabled |
| POSTED | Post URL shown, confetti / success state |
| FAILED | Red banner, `error_message` displayed, retry option |
