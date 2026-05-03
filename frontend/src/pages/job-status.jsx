import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCcw,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
import { PostWorkflowModal } from "@/components/ui/post-workflow-modal";
import { useJobPoll } from "@/hooks/use-job-poll";
import { resolveAssetUrl } from "@/api/client";
import { cn } from "@/lib/utils";

const STAGE_ORDER = [
  { key: "image", label: "Image", states: ["GENERATING_IMAGE"] },
  { key: "3d", label: "3D", states: ["GENERATING_3D"], optional: true },
  { key: "video", label: "Video", states: ["GENERATING_VIDEO"] },
  { key: "ready", label: "Ready", states: ["VIDEO_READY"] },
  { key: "posted", label: "Posted", states: ["POSTED"] },
];

function progressIndex(status, use3d) {
  const order = ["PENDING"];
  order.push("GENERATING_IMAGE");
  if (use3d) order.push("GENERATING_3D");
  order.push("GENERATING_VIDEO", "VIDEO_READY", "POSTED");
  const idx = order.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function JobStatusPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { job, loading, error, refresh } = useJobPoll(jobId);
  const [showPostModal, setShowPostModal] = React.useState(false);

  if (loading && !job) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <CpuArchitecture width="320" height="160" text="VERA" className="text-white/15" />
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/30 animate-pulse">
          loading pipeline…
        </p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-32">
      <button
        onClick={() => navigate("/")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brief
      </button>

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
            job · {jobId}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {job?.prompt || "Untitled brief"}
          </h1>
          {job && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
              <StatusBadge status={job.status} />
              <span className="text-white/30">·</span>
              <span>avatar {job.avatar_id}</span>
              <span className="text-white/30">·</span>
              <span>{job.duration_seconds}s</span>
              <span className="text-white/30">·</span>
              <span className="capitalize">{job.platform}</span>
              {job.use_3d && (
                <>
                  <span className="text-white/30">·</span>
                  <span>3D</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </header>

      {error && !job && (
        <ErrorPanel className="mt-10" message={error} onRetry={refresh} />
      )}

      {job && (
        <>
          <ProgressTrack
            status={job.status}
            use3d={job.use_3d}
            className="mt-10"
          />

          {job.status === "FAILED" && job.error_message && (
            <ErrorPanel
              className="mt-8"
              message={job.error_message}
              onRetry={refresh}
              title="Pipeline failed"
            />
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <AssetPanel
              title="Reference image"
              url={resolveAssetUrl(job.input_image_url)}
              empty="No reference uploaded"
              kind="image"
            />
            <AssetPanel
              title="Generated image"
              url={resolveAssetUrl(job.generated_image_url)}
              empty={
                job.status === "PENDING" || job.status === "GENERATING_IMAGE"
                  ? "DALL·E 3 is generating…"
                  : "—"
              }
              kind="image"
            />
            {job.use_3d && (
              <AssetPanel
                title="3D model (Tripo3D)"
                url={resolveAssetUrl(job.model_3d_url)}
                empty={
                  job.status === "GENERATING_3D"
                    ? "Tripo3D is building the model… (2–5 min)"
                    : "—"
                }
                kind="file"
              />
            )}
            <AssetPanel
              title="Video"
              url={resolveAssetUrl(job.video_url)}
              empty={
                job.status === "GENERATING_VIDEO"
                  ? "Seedance is rendering…"
                  : "Awaiting earlier stages"
              }
              kind="video"
              span="md:col-span-2"
            />
          </div>

          {(job.status === "VIDEO_READY" || job.status === "POSTED") && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {job.status === "POSTED" ? "Video has been posted." : "Video is ready for review."}
                  </p>
                  <p className="text-xs text-white/55">
                    {job.status === "POSTED"
                      ? "Post it again to another platform or re-post."
                      : <>Approve to publish to <span className="capitalize">{job.platform}</span> via Upload-Post.</>}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowPostModal(true)}
                size="lg"
                className="min-w-[180px]"
              >
                <Send className="mr-2 h-4 w-4" />
                {job.status === "POSTED" ? "Post again" : "Approve & Post"}
              </Button>
            </div>
          )}

          {job.status === "POSTED" && job.post_url && (
            <PostedPanel url={job.post_url} platform={job.platform} />
          )}
        </>
      )}

      <PostWorkflowModal
        jobId={jobId}
        open={showPostModal}
        onClose={() => { setShowPostModal(false); refresh(); }}
      />
    </main>
  );
}

function ProgressTrack({ status, use3d, className }) {
  const stages = STAGE_ORDER.filter((s) => use3d || s.key !== "3d");
  const orderForJob = ["PENDING", "GENERATING_IMAGE"];
  if (use3d) orderForJob.push("GENERATING_3D");
  orderForJob.push("GENERATING_VIDEO", "VIDEO_READY", "POSTED");
  const idx = progressIndex(status, use3d);
  const fraction = Math.min(1, Math.max(0, idx / (orderForJob.length - 1)));

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/[0.02] p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
          Pipeline
        </p>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
          {Math.round(fraction * 100)}%
        </p>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/40"
          animate={{ width: `${fraction * 100}%` }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
        />
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-5">
        {stages.map((stage) => {
          const reached =
            stage.states.some(
              (s) => orderForJob.indexOf(s) <= idx && idx >= 0,
            ) ||
            (stage.key === "posted" && status === "POSTED") ||
            (stage.key === "ready" &&
              (status === "VIDEO_READY" || status === "POSTED"));
          const active = stage.states.includes(status);
          return (
            <li
              key={stage.key}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-xs",
                active
                  ? "border-primary/50 bg-primary/10 text-white"
                  : reached
                    ? "border-white/15 bg-white/[0.03] text-white/80"
                    : "border-white/5 bg-transparent text-white/40",
              )}
            >
              <p className="flex items-center gap-2 font-medium">
                {stage.label}
                {stage.optional && (
                  <span className="rounded-full border border-white/15 px-1.5 py-px text-[0.55rem] uppercase tracking-[0.2em] text-white/55">
                    opt
                  </span>
                )}
              </p>
              {active && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-[0.65rem] text-white/55">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  in progress
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AssetPanel({ title, url, empty, kind, span }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.02] p-5",
        span,
      )}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
        {title}
      </p>
      <div className="mt-3">
        {url ? (
          kind === "video" ? (
            <video
              src={url}
              controls
              playsInline
              className="aspect-[9/16] w-full max-w-[360px] rounded-lg border border-white/10 bg-black"
            />
          ) : kind === "image" ? (
            <img
              src={url}
              alt={title}
              className="aspect-square w-full max-w-[280px] rounded-lg border border-white/10 object-cover"
            />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/75 transition-colors hover:bg-white/10"
            >
              Download .glb
            </a>
          )
        ) : (
          <p className="text-sm text-white/50">{empty}</p>
        )}
      </div>
    </div>
  );
}

function PostedPanel({ url, platform }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <div>
            <p className="text-sm font-medium text-white">
              Published to <span className="capitalize">{platform}</span>
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-200 hover:underline"
            >
              {url}
            </a>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy URL"}
        </Button>
      </div>
    </div>
  );
}

function ErrorPanel({ className, message, onRetry, retryLabel, title }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            {title || "Something went wrong"}
          </p>
          <p className="mt-1 text-sm text-red-200/85">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            {retryLabel || "Retry"}
          </Button>
        )}
      </div>
    </div>
  );
}

