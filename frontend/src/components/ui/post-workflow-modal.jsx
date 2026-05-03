import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle2, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { publishToplatform } from "@/api/jobs";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok",   label: "TikTok"    },
];

const FAKE_STEPS = [
  { ms: 0,    text: ()  => `Connecting to Upload-Post API…` },
  { ms: 500,  text: (p) => `Authenticating ${p} account…` },
  { ms: 1100, text: (p) => `Preparing 9:16 video for ${p}…` },
  { ms: 1800, text: ()  => `Transferring video…` },
];

function usePostWorkflow(jobId) {
  const [steps, setSteps] = React.useState(
    PLATFORMS.map((p) => ({ ...p, status: "idle", url: null, error: null, logs: [] }))
  );
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  const updateStep = (id, patch) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const pushLog = (id, line) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, logs: [...s.logs, line] } : s))
    );

  const run = React.useCallback(async (selected) => {
    setStarted(true);
    const queue = PLATFORMS.filter((p) => selected.includes(p.id));

    for (const platform of queue) {
      updateStep(platform.id, { status: "loading", logs: [] });

      const timers = FAKE_STEPS.map(({ ms, text }) =>
        setTimeout(() => pushLog(platform.id, text(platform.label)), ms)
      );

      try {
        const result = await publishToplatform(jobId, platform.id);
        timers.forEach(clearTimeout);
        if (result.success) {
          const msg = result.async
            ? `Processing in background — check ${platform.label} shortly`
            : `Post published successfully`;
          pushLog(platform.id, msg);
          updateStep(platform.id, { status: "done", url: result.url });
        } else {
          pushLog(platform.id, `Failed: ${result.error || "Upload rejected"}`);
          updateStep(platform.id, { status: "error", error: result.error || "Upload failed" });
        }
      } catch (err) {
        timers.forEach(clearTimeout);
        pushLog(platform.id, `Error: ${err.message || "Network error"}`);
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <Dialog.Title className="text-sm font-semibold text-white">
                Post to social media
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-white/35">
                {started ? "Publishing Vera's video…" : "Select platforms to publish to"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              {!started ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-3"
                >
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/30">
                    Select platforms
                  </p>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggle(p.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                          selected.includes(p.id)
                            ? "border-primary/30 bg-primary/[0.06] text-white"
                            : "border-white/[0.07] bg-white/[0.02] text-white/45 hover:border-white/[0.12] hover:text-white/65"
                        )}
                      >
                        <span className={cn(
                          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors",
                          selected.includes(p.id) ? "border-primary bg-primary text-black" : "border-white/20"
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
                </motion.div>
              ) : (
                <motion.div
                  key="workflow"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2.5"
                >
                  {steps
                    .filter((s) => selected.includes(s.id))
                    .map((step) => (
                      <ThinkingBlock key={step.id} step={step} />
                    ))}

                  <AnimatePresence>
                    {finished && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3"
                      >
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" />
                          All done
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {steps.filter((s) => s.status === "done" && s.url).map((s) => (
                            <a
                              key={s.id}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-white/40 underline underline-offset-2 hover:text-white/70"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View {s.label} post
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ThinkingBlock({ step }) {
  const [expanded, setExpanded] = React.useState(true);
  const isLoading = step.status === "loading";
  const isDone    = step.status === "done";
  const isError   = step.status === "error";

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border transition-colors duration-300",
        isLoading ? "border-primary/20 bg-primary/[0.03]" :
        isDone    ? "border-emerald-500/20 bg-emerald-500/[0.03]" :
        isError   ? "border-red-500/20 bg-red-500/[0.03]" :
                    "border-white/[0.06] bg-white/[0.01]"
      )}
    >
      {/* Block header */}
      <button
        onClick={() => step.logs.length > 0 && setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <StatusIcon status={step.status} />
        <span className={cn(
          "flex-1 text-sm font-medium",
          isLoading ? "text-white" :
          isDone    ? "text-emerald-300" :
          isError   ? "text-red-300" :
                      "text-white/35"
        )}>
          {step.label}
        </span>
        {isLoading && (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-primary/50 animate-pulse">
            posting
          </span>
        )}
        {isDone && (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-emerald-500/50">
            done
          </span>
        )}
        {isError && (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-red-500/50">
            failed
          </span>
        )}
        {step.logs.length > 0 && (
          expanded
            ? <ChevronUp className="h-3.5 w-3.5 text-white/15" />
            : <ChevronDown className="h-3.5 w-3.5 text-white/15" />
        )}
      </button>

      {/* Log lines */}
      <AnimatePresence>
        {expanded && step.logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] px-4 pb-3.5 pt-2.5">
              <div className="space-y-1.5">
                {step.logs.map((line, i) => (
                  <LogLine
                    key={i}
                    text={line}
                    index={i}
                    isLast={i === step.logs.length - 1}
                    isLoading={isLoading}
                  />
                ))}
              </div>
              {isDone && step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400/60 underline underline-offset-2 hover:text-emerald-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  View post
                </a>
              )}
              {isError && step.error && (
                <p className="mt-2 text-xs text-red-400/70">{step.error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LogLine({ text, index, isLast, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className="flex items-start gap-2"
    >
      <span className="mt-px font-mono text-[0.6rem] text-white/15 select-none">›</span>
      <span className={cn(
        "font-mono text-[0.7rem] leading-relaxed",
        isLast && isLoading ? "text-white/55 animate-pulse" : "text-white/30"
      )}>
        {text}
      </span>
    </motion.div>
  );
}

function StatusIcon({ status }) {
  if (status === "loading") return <Spinner />;
  if (status === "done")    return <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />;
  if (status === "error")   return <AlertCircle  className="h-4 w-4 flex-shrink-0 text-red-400" />;
  return (
    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 flex-shrink-0 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
