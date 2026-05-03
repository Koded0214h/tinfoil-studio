import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ImageIcon,
  Boxes,
  Video,
  AlertTriangle,
  CheckCircle2,
  Download,
} from "lucide-react";

import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { AIThinkingBlock } from "@/components/ui/ai-thinking-block";
import { ModelViewer3D } from "@/components/ui/model-viewer-3d";
import { PostWorkflowModal } from "@/components/ui/post-workflow-modal";
import { createJob } from "@/api/jobs";
import { useJobPoll } from "@/hooks/use-job-poll";
import { resolveAssetUrl } from "@/api/client";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Vera in a Tokyo neon alley at midnight, slow cinematic push-in",
  "Fashion editorial under cold studio light, 9:16 format",
  "Vera walking a Parisian street in a charcoal trench, golden hour",
];

function getPanelState(job, panel) {
  if (!job) return "waiting";

  if (job.status === "FAILED") {
    if (panel === "image" && !job.generated_image_url) return "failed";
    if (panel === "3d" && job.generated_image_url && !job.model_3d_url) return "failed";
    if (panel === "video" && job.model_3d_url && !job.video_url) return "failed";
  }

  if (panel === "image") {
    if (job.generated_image_url) return "done";
    if (job.status === "GENERATING_IMAGE") return "loading";
    return "queued";
  }

  if (panel === "3d") {
    if (job.model_3d_url) return "done";
    if (job.status === "GENERATING_3D") return "loading";
    if (job.generated_image_url) return "queued";
    return "waiting";
  }

  if (panel === "video") {
    if (job.video_url) return "done";
    if (job.status === "GENERATING_VIDEO") return "loading";
    if (job.model_3d_url) return "queued";
    return "waiting";
  }

  return "waiting";
}

export default function PromptPage() {
  const [jobId, setJobId] = React.useState(
    () => localStorage.getItem("vera_last_job_id") || null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);
  const [showPostModal, setShowPostModal] = React.useState(false);
  const { job } = useJobPoll(jobId);

  const handleSend = async (message, files) => {
    if (!message.trim() && (!files || files.length === 0)) return;
    const rawPrompt = message
      .replace(/^\[(Search|Think|Canvas): /, "")
      .replace(/\]$/, "");
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newJob = await createJob({
        prompt: rawPrompt || null,
        avatarId: "vera",
        duration: 6,
        use3d: true,
        platform: "instagram",
        inputImage: files?.[0] ?? null,
      });
      setJobId(newJob.id);
      localStorage.setItem("vera_last_job_id", newJob.id);
    } catch (err) {
      setSubmitError(err.detail || err.message || "Could not start the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show thinking: while creating the job OR while image is still generating
  const isThinking =
    isSubmitting ||
    (jobId && job && !job.generated_image_url && job.status !== "FAILED");

  const isIdle = !jobId && !isSubmitting;
  // Panels visible once image is ready (or job failed)
  const showPanels = Boolean(jobId) && !isThinking;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background glow — idle only */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── IDLE LAYOUT ── */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-screen flex-col items-center justify-center px-4 pb-8 pt-24"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 flex flex-col items-center gap-4 text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.4em] text-white/60 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Vera · ready
              </span>
              <h1 className="max-w-xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                What do you want{" "}
                <span className="bg-gradient-to-br from-primary via-white to-primary/40 bg-clip-text text-transparent">
                  Vera
                </span>{" "}
                to create?
              </h1>
              <p className="max-w-md text-balance text-sm text-white/50">
                Describe your scene — Vera turns it into a 9:16 social-ready
                clip, fully automated.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full max-w-2xl"
            >
              <PromptInputBox
                onSend={handleSend}
                isLoading={isSubmitting}
                placeholder="Describe the scene you want Vera to perform…"
              />
              {submitError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center text-xs text-red-400"
                >
                  {submitError}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-2"
            >
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { if (!isSubmitting) handleSend(s, []); }}
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55 transition-colors",
                    "hover:border-white/20 hover:bg-white/[0.06] hover:text-white/80",
                    "disabled:pointer-events-none disabled:opacity-40",
                  )}
                >
                  <Sparkles className="h-3 w-3 text-primary/70" />
                  {s}
                </button>
              ))}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── THINKING STATE ── */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-8"
          >
            {/* Brief echo */}
            {job?.prompt && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 max-w-lg text-center text-sm text-white/40 italic"
              >
                "{job.prompt}"
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-md"
            >
              <AIThinkingBlock label="Vera is thinking" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PANELS LAYOUT ── */}
      <AnimatePresence>
        {showPanels && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen flex-col px-10 pb-44 pt-28 md:px-16 lg:px-24"
          >
            {/* Brief + status row */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-white/35">
                  brief
                </p>
                {job?.prompt && (
                  <p className="mt-1 max-w-xl text-sm text-white/70">
                    {job.prompt}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {job && <StatusPill status={job.status} />}
                {(job?.status === "VIDEO_READY" || job?.status === "POSTED") && (
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                  >
                    {job?.status === "POSTED" ? "Post again" : "Post"}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Three pipeline panels */}
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
              <PipelinePanel
                title="Image"
                icon={ImageIcon}
                state={getPanelState(job, "image")}
                loadingLabel="Pollinations generating…"
                delay={0}
              >
                {job?.generated_image_url && (
                  <img
                    src={resolveAssetUrl(job.generated_image_url)}
                    alt="Generated"
                    className="w-full rounded-xl border border-white/10 object-cover"
                  />
                )}
              </PipelinePanel>

              <PipelinePanel
                title="3D Model"
                icon={Boxes}
                state={getPanelState(job, "3d")}
                loadingLabel="Tripo3D building model…"
                delay={0.06}
              >
                {job?.model_3d_url && (
                  <div className="flex w-full flex-col gap-3">
                    <ModelViewer3D src={resolveAssetUrl(job.model_3d_url)} />
                    <a
                      href={resolveAssetUrl(job.model_3d_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download .glb
                    </a>
                  </div>
                )}
              </PipelinePanel>

              <PipelinePanel
                title="Video"
                icon={Video}
                state={getPanelState(job, "video")}
                loadingLabel="Pollinations rendering…"
                delay={0.12}
              >
                {job?.video_url && (
                  <div className="flex w-full flex-col gap-3">
                    <video
                      src={resolveAssetUrl(job.video_url)}
                      controls
                      playsInline
                      autoPlay
                      className="w-full rounded-xl border border-white/10 bg-black"
                      style={{ aspectRatio: "9/16", maxHeight: "62vh" }}
                    />
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="w-full rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                    >
                      Post to social media
                    </button>
                  </div>
                )}
              </PipelinePanel>
            </div>

            {/* Pipeline error */}
            {job?.status === "FAILED" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-4"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                <div>
                  <p className="text-sm font-medium text-white">Pipeline failed</p>
                  {job.error_message && (
                    <p className="mt-1 text-xs text-red-200/80">{job.error_message}</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POST WORKFLOW MODAL ── */}
      {jobId && (
        <PostWorkflowModal
          jobId={jobId}
          open={showPostModal}
          onClose={() => setShowPostModal(false)}
        />
      )}

      {/* ── FIXED BOTTOM PROMPT BAR (after first submit) ── */}
      <AnimatePresence>
        {(isThinking || showPanels) && (
          <motion.div
            key="bottom-bar"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/85 px-6 py-4 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-3xl">
              <PromptInputBox
                onSend={handleSend}
                isLoading={isSubmitting}
                placeholder="Brief another scene…"
              />
              {submitError && (
                <p className="mt-2 text-center text-xs text-red-400">{submitError}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PipelinePanel({ title, icon: Icon, state, loadingLabel, disabledLabel, delay = 0, children }) {
  const borderColor =
    state === "done"     ? "border-white/15" :
    state === "loading"  ? "border-primary/30" :
    state === "failed"   ? "border-red-500/30" :
    state === "disabled" ? "border-white/[0.06]" :
                           "border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn(
        "relative flex min-h-[300px] flex-col rounded-2xl border bg-white/[0.02] p-5",
        borderColor,
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4",
              state === "done"     ? "text-emerald-400" :
              state === "loading"  ? "text-primary" :
              state === "failed"   ? "text-red-400" :
              state === "disabled" ? "text-white/20" :
                                     "text-white/35",
            )}
          />
          <span
            className={cn(
              "text-[0.65rem] font-medium uppercase tracking-[0.3em]",
              state === "disabled" ? "text-white/25" : "text-white/50",
            )}
          >
            {title}
          </span>
        </div>
        <StatusDot state={state} />
      </div>

      <div className="flex flex-1 items-center justify-center">
        {state === "loading" && (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <div className="w-full space-y-2.5">
              {[80, 65, 50].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 animate-pulse rounded-full bg-white/[0.06]"
                  style={{ width: `${w}%`, animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-white/35">{loadingLabel}</p>
          </div>
        )}

        {state === "queued" && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
              <Icon className="h-5 w-5 text-white/20" />
            </div>
            <p className="text-xs text-white/30">Queued…</p>
          </div>
        )}

        {state === "waiting" && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
              <Icon className="h-5 w-5 text-white/20" />
            </div>
            <p className="text-xs text-white/30">Waiting for earlier stage…</p>
          </div>
        )}

        {state === "disabled" && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07]">
              <Icon className="h-5 w-5 text-white/15" />
            </div>
            <p className="text-xs text-white/25">{disabledLabel || "Not enabled"}</p>
          </div>
        )}

        {state === "failed" && (
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-400/60" />
            <p className="text-xs text-red-400/70">Stage failed</p>
          </div>
        )}

        {state === "done" && (
          <div className="flex w-full flex-col items-center">{children}</div>
        )}
      </div>

      {state === "done" && (
        <CheckCircle2 className="absolute right-4 top-4 h-4 w-4 text-emerald-400" />
      )}
    </motion.div>
  );
}

function StatusDot({ state }) {
  if (state === "loading") {
    return (
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
    );
  }
  if (state === "done")     return <span className="h-2 w-2 rounded-full bg-emerald-400" />;
  if (state === "failed")   return <span className="h-2 w-2 rounded-full bg-red-400" />;
  if (state === "disabled") return <span className="h-2 w-2 rounded-full bg-white/10" />;
  return <span className="h-2 w-2 animate-pulse rounded-full bg-white/20" />;
}

function StatusPill({ status }) {
  const cfg = {
    PENDING:           { label: "Queued",            cls: "text-white/50 border-white/15 bg-white/[0.03]",                pulse: false },
    GENERATING_IMAGE:  { label: "Generating image",  cls: "text-primary border-primary/30 bg-primary/10",               pulse: true  },
    GENERATING_3D:     { label: "Building 3D model", cls: "text-primary border-primary/30 bg-primary/10",               pulse: true  },
    GENERATING_VIDEO:  { label: "Rendering video",   cls: "text-primary border-primary/30 bg-primary/10",               pulse: true  },
    VIDEO_READY:       { label: "Complete",           cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/[0.06]", pulse: false },
    POSTED:            { label: "Posted",             cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/[0.06]", pulse: false },
    FAILED:            { label: "Failed",             cls: "text-red-300 border-red-500/30 bg-red-500/[0.06]",           pulse: false },
  };
  const c = cfg[status] ?? cfg.PENDING;

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", c.cls)}>
      {c.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {c.label}
    </span>
  );
}
