import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Image as ImageIcon,
  Boxes,
  Clock,
  Send,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InstagramMark, TikTokMark, YouTubeMark } from "@/components/icons/brand-marks";

const PROMPT_SUGGESTIONS = [
  "Vera in a Tokyo neon alley at midnight, slow cinematic push-in…",
  "Vera, fashion editorial under cold studio light, 9:16, 10s…",
  "Vera walking a Parisian street in a charcoal trench, golden hour…",
  "Vera centered on a black runway, hard rim light, high contrast…",
  "Vera in a futuristic boutique, ambient neon, glass reflections…",
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

function useTypewriterPlaceholder(phrases, { typeMs = 38, holdMs = 1600, eraseMs = 18 } = {}) {
  const [text, setText] = React.useState("");
  const indexRef = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;
    let timer;

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

    const sleep = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    run();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases, typeMs, holdMs, eraseMs]);

  return text;
}

export function PromptBox({ className }) {
  const [value, setValue] = React.useState("");
  const [duration, setDuration] = React.useState(10);
  const [platform, setPlatform] = React.useState("instagram");
  const [use3d, setUse3d] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const placeholder = useTypewriterPlaceholder(PROMPT_SUGGESTIONS);
  const showTypewriter = value.length === 0;

  const onSubmit = (event) => {
    event.preventDefault();
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    // Front-end stub for the eventual POST /api/jobs call. The PRD's
    // generation pipeline takes minutes, so on the real wire this would
    // create a PENDING job and switch to the polling status page.
    setTimeout(() => setSubmitting(false), 1800);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Ambient halo behind the box, picking up the lamp's blue cast. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, hsl(var(--primary) / 0.35) 0%, transparent 70%)",
        }}
      />

      <form
        onSubmit={onSubmit}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl transition-colors focus-within:border-white/20"
      >
        {/* Animated gradient ring on focus / hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, hsl(var(--primary) / 0.45), transparent 35%, transparent 65%, hsl(var(--primary) / 0.45))",
            mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            WebkitMask:
              "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />

        <div className="rounded-[15px] bg-black/40 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Brief
            <span className="ml-auto inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.25em] text-white/35">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Vera ready
            </span>
          </div>

          <div className="relative mt-4">
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={3}
              spellCheck={false}
              className="block w-full resize-none bg-transparent text-base leading-relaxed text-white placeholder:text-transparent focus:outline-none sm:text-lg"
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
              label="3D model"
              hint="Tripo3D"
              active={use3d}
              onClick={() => setUse3d((v) => !v)}
            />
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Reference image
            </button>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/5 pt-4">
            <p className="max-w-md text-xs text-white/35">
              Generates a 9:16 social-ready clip. Vera's visual & motion
              templates are applied automatically.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={!value.trim() || submitting}
              className="min-w-[140px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Queuing
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
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

