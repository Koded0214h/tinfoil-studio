import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Image as ImageIcon,
  Boxes,
  Clock,
  ArrowUpRight,
  Loader2,
  X as XIcon,
  AlertTriangle,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  InstagramMark,
  TikTokMark,
  YouTubeMark,
} from "@/components/icons/brand-marks";
import { createJob } from "@/api/jobs";

const PROMPT_SUGGESTIONS = [
  "Vera in a Tokyo neon alley at midnight, slow cinematic push-in…",
  "Fashion editorial under cold studio light, 9:16, 10s…",
  "Vera walking a Parisian street in a charcoal trench, golden hour…",
  "Vera centered on a black runway, hard rim light, high contrast…",
  "Vera in a futuristic boutique, ambient neon, glass reflections…",
];

const QUICK_CHIPS = [
  "Vera, fashion editorial, cold studio light",
  "Vera in a Tokyo neon alley, push-in",
  "Vera on a black runway, rim light",
];

const DURATIONS = [
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram", Icon: InstagramMark },
  { value: "tiktok", label: "TikTok", Icon: TikTokMark },
  { value: "youtube", label: "YouTube", Icon: YouTubeMark },
];

function useTypewriterPlaceholder(
  phrases,
  { typeMs = 38, holdMs = 1600, eraseMs = 18 } = {},
) {
  const [text, setText] = React.useState("");
  const indexRef = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;
    let timer;

    const sleep = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const run = async () => {
      while (!cancelled) {
        const phrase = phrases[indexRef.current % phrases.length];
        for (let i = 1; i <= phrase.length && !cancelled; i++) {
          setText(phrase.slice(0, i));
          await sleep(typeMs);
        }
        await sleep(holdMs);
        for (let i = phrase.length; i >= 0 && !cancelled; i--) {
          setText(phrase.slice(0, i));
          await sleep(eraseMs);
        }
        indexRef.current += 1;
      }
    };

    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases, typeMs, holdMs, eraseMs]);

  return text;
}

export function PromptBox({ className }) {
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  const [value, setValue] = React.useState("");
  const [duration, setDuration] = React.useState(10);
  const [platform, setPlatform] = React.useState("instagram");
  const [use3d, setUse3d] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [refImage, setRefImage] = React.useState(null);

  const placeholder = useTypewriterPlaceholder(PROMPT_SUGGESTIONS);
  const showTypewriter = value.length === 0;

  const previewUrl = React.useMemo(() => {
    if (!refImage) return null;
    return URL.createObjectURL(refImage);
  }, [refImage]);
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Global "/" shortcut to focus the brief — a quiet peak-UX touch.
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === "/" && document.activeElement?.tagName !== "TEXTAREA") {
        event.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitJob = async (overrideValue) => {
    const finalValue = (overrideValue ?? value).trim();
    if (submitting) return;
    if (!finalValue && !refImage) {
      setError("Add a prompt or reference image to brief Vera.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const job = await createJob({
        prompt: finalValue || null,
        avatarId: "vera",
        duration,
        use3d,
        platform,
        inputImage: refImage,
      });
      // Hand off to the existing /prompt page — its useState reads this key
      // on mount and immediately starts polling + showing panels.
      try {
        localStorage.setItem("vera_last_job_id", job.id);
      } catch {
        /* private mode etc — non-fatal */
      }
      navigate("/prompt");
    } catch (err) {
      setError(err.detail || err.message || "Could not start the job.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    submitJob();
  };

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Reference must be an image file.");
      return;
    }
    setError(null);
    setRefImage(file);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Ambient halo behind the box, picking up the lamp's blue cast. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-16 -inset-y-20 -z-10 blur-3xl"
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, hsl(var(--primary) / 0.45) 0%, transparent 70%)",
        }}
      />

      <form
        onSubmit={onSubmit}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl transition-colors focus-within:border-white/25"
      >
        {/* Animated conic ring on focus / hover — the "peak" border. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, hsl(var(--primary) / 0.55), transparent 35%, transparent 65%, hsl(var(--primary) / 0.55))",
            mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            WebkitMask:
              "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />

        <div className="rounded-[15px] bg-black/45 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Brief
            <kbd className="ml-1 hidden items-center gap-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.6rem] tracking-normal text-white/45 sm:inline-flex">
              /
            </kbd>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.25em] text-white/40 sm:text-[0.65rem]">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Vera ready
            </span>
          </div>

          <div className="relative mt-4">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={3}
              spellCheck={false}
              disabled={submitting}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  submitJob();
                }
              }}
              className="block w-full resize-none bg-transparent text-base leading-relaxed text-white placeholder:text-transparent focus:outline-none disabled:opacity-60 sm:text-lg"
              aria-label="Describe the video you want Vera to make"
            />
            {showTypewriter && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 select-none text-base leading-relaxed text-white/35 sm:text-lg"
              >
                {placeholder}
                <span className="ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-[2px] animate-pulse bg-white/55 align-middle" />
              </div>
            )}
          </div>

          <AnimatePresence>
            {refImage && (
              <motion.div
                initial={{ opacity: 0, y: 6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 6, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt={refImage.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="truncate text-white">{refImage.name}</p>
                    <p className="text-white/40">
                      Will be passed as Seedance reference frame.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRefImage(null)}
                    className="rounded-full p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Remove reference image"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
            <SegmentedControl
              icon={Clock}
              label="Duration"
              options={DURATIONS}
              value={duration}
              onChange={setDuration}
            />
            <PlatformControl value={platform} onChange={setPlatform} />
            <ToggleChip
              icon={Boxes}
              label="3D"
              hint="Tripo3D"
              active={use3d}
              onClick={() => setUse3d((v) => !v)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              {refImage ? "Replace" : "Reference"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPickFile}
              className="hidden"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                role="alert"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-5 flex flex-col items-stretch gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <p className="max-w-md text-xs text-white/35">
              9:16, social-ready. Vera's visual & motion templates are applied
              automatically.{" "}
              <span className="hidden text-white/30 sm:inline">
                ⌘&thinsp;Enter to send.
              </span>
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting || (!value.trim() && !refImage)}
              className="group/cta min-w-[160px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Queuing
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Brief Vera
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Quick-fill chips. Click → fills the textarea + immediately submits. */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={submitting}
            onClick={() => {
              setValue(chip);
              textareaRef.current?.focus();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white/85 disabled:pointer-events-none disabled:opacity-40"
          >
            <Sparkles className="h-3 w-3 text-primary/70" />
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function SegmentedControl({ icon: Icon, label, options, value, onChange }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      <span className="ml-2 mr-1 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-white/45">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active ? "text-white" : "text-white/55 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${label}`}
                className="absolute inset-0 -z-10 rounded-full bg-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PlatformControl({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Target platform"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      {PLATFORMS.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-label={label}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active ? "text-white" : "text-white/55 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="platform-pill"
                className="absolute inset-0 -z-10 rounded-full bg-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleChip({ icon: Icon, label, hint, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-primary/50 bg-primary/15 text-white"
          : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10",
      )}
      aria-pressed={active}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="text-white/35">{hint}</span>
      <span
        className={cn(
          "ml-1 h-1.5 w-1.5 rounded-full",
          active ? "bg-primary" : "bg-white/20",
        )}
      />
    </button>
  );
}
