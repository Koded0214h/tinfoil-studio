import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { publishToplatform } from "@/api/jobs";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok",   label: "TikTok"    },
];

// step status: "idle" | "loading" | "done" | "error"
function usePostWorkflow(jobId) {
  const [steps, setSteps] = React.useState(
    PLATFORMS.map((p) => ({ ...p, status: "idle", url: null, error: null }))
  );
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  const updateStep = (id, patch) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const run = React.useCallback(async (selected) => {
    setStarted(true);
    const queue = PLATFORMS.filter((p) => selected.includes(p.id));

    for (const platform of queue) {
      updateStep(platform.id, { status: "loading" });
      try {
        const result = await publishToplatform(jobId, platform.id);
        if (result.success) {
          updateStep(platform.id, { status: "done", url: result.url });
        } else {
          updateStep(platform.id, { status: "error", error: result.error || "Upload failed" });
        }
      } catch (err) {
        updateStep(platform.id, { status: "error", error: err.message || "Network error" });
      }
    }
    setFinished(true);
  }, [jobId]);

  return { steps, started, finished, run };
}

export function PostWorkflowModal({ jobId, open, onClose }) {
  const [selected, setSelected] = React.useState(["instagram", "tiktok"]);
  const { steps, started, finished, run } = usePostWorkflow(jobId);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0a0a0a] p-0 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <Dialog.Title className="text-sm font-semibold text-white">
                Post to social media
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-white/40">
                Upload Vera's video to your connected accounts
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-5 py-5">
            {!started ? (
              /* Platform selection */
              <div className="space-y-3">
                <p className="text-xs text-white/40">Select platforms</p>
                <div className="space-y-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                        selected.includes(p.id)
                          ? "border-primary/30 bg-primary/[0.06] text-white"
                          : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/15 hover:text-white/70"
                      )}
                    >
                      <span className={cn(
                        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors",
                        selected.includes(p.id)
                          ? "border-primary bg-primary text-black"
                          : "border-white/20"
                      )}>
                        {selected.includes(p.id) && (
                          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-current">
                            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => run(selected)}
                  disabled={selected.length === 0}
                  className="mt-2 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black transition-opacity disabled:opacity-40 hover:opacity-90"
                >
                  Start posting
                </button>
              </div>
            ) : (
              /* Workflow steps */
              <div className="space-y-0">
                {PLATFORMS.filter((p) => steps.find((s) => s.id === p.id && s.status !== "idle")).map((p, idx, arr) => {
                  const step = steps.find((s) => s.id === p.id);
                  const isLast = idx === arr.length - 1;
                  return (
                    <div key={p.id}>
                      <StepRow step={step} />
                      {!isLast && (
                        <div className="ml-[11px] h-5 w-px bg-white/[0.08]" />
                      )}
                    </div>
                  );
                })}

                {/* Queued (not started yet) */}
                {steps
                  .filter((s) => s.status === "idle" && PLATFORMS.some((p) => p.id === s.id))
                  .map((step, idx) => (
                    <div key={step.id}>
                      <div className="ml-[11px] h-5 w-px bg-white/[0.08]" />
                      <StepRow step={step} />
                    </div>
                  ))}

                {finished && (
                  <>
                    <div className="ml-[11px] h-5 w-px bg-white/[0.08]" />
                    <div className="flex items-start gap-3 py-1">
                      <span className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </span>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium text-emerald-300">All done!</p>
                        <div className="mt-2 space-y-1.5">
                          {steps
                            .filter((s) => s.status === "done" && s.url)
                            .map((s) => (
                              <a
                                key={s.id}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs text-white/50 underline underline-offset-2 hover:text-white/80"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {s.label} post
                              </a>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StepRow({ step }) {
  const isLoading = step.status === "loading";
  const isDone    = step.status === "done";
  const isError   = step.status === "error";
  const isIdle    = step.status === "idle";

  return (
    <div className="flex items-start gap-3 py-1">
      {/* Status dot */}
      <span className={cn(
        "mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border transition-all",
        isLoading ? "border-primary/50 bg-primary/10" :
        isDone    ? "border-emerald-500/40 bg-emerald-500/10" :
        isError   ? "border-red-500/40 bg-red-500/10" :
                    "border-white/[0.10] bg-transparent",
      )}>
        {isLoading && <Spinner />}
        {isDone    && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
        {isError   && <AlertCircle  className="h-3.5 w-3.5 text-red-400"     />}
        {isIdle    && <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
      </span>

      {/* Text */}
      <div className="flex-1 pt-0.5">
        <p className={cn(
          "text-sm transition-colors",
          isLoading ? "text-white animate-pulse"  :
          isDone    ? "text-white/70"             :
          isError   ? "text-red-300"              :
                      "text-white/30",
        )}>
          {isLoading ? `Uploading to ${step.label}…` :
           isDone    ? `Uploaded to ${step.label}` :
           isError   ? `${step.label} failed` :
                       `Uploading to ${step.label}`}
        </p>
        {isDone && step.url && (
          <a
            href={step.url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 flex items-center gap-1 text-xs text-white/35 underline underline-offset-2 hover:text-white/60"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View post
          </a>
        )}
        {isError && step.error && (
          <p className="mt-0.5 text-xs text-red-400/70">{step.error}</p>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
