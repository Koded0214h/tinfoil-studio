import * as React from "react";
import { motion } from "framer-motion";
import { Check, Copy, Sparkles, Quote, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import { getAvatarConfig } from "@/api/avatars";
import { cn } from "@/lib/utils";

const FALLBACK = {
  visual_prompt:
    "Vera, a hyper-realistic AI talent, dark studio lighting, fashion editorial style, sharp features, dark hair, contemporary wardrobe — ",
  motion_prompt:
    "smooth cinematic motion, slow push-in, social-native pacing, vertical 9:16, high contrast, platform-optimised — ",
};

const TRAITS = [
  { label: "Look", value: "Hyper-real · editorial" },
  { label: "Lighting", value: "Dark studio · cold rim" },
  { label: "Wardrobe", value: "Contemporary · sharp" },
  { label: "Pacing", value: "Slow push-in · cinematic" },
  { label: "Format", value: "9:16 · social-native" },
];

const STAT_CARDS = [
  { label: "Avatars", value: "1", sub: "More coming" },
  { label: "Aspect", value: "9:16", sub: "Social-native" },
  { label: "Length", value: "5–15s", sub: "Per clip" },
];

export function MeetVera() {
  const [config, setConfig] = React.useState(FALLBACK);
  const [loaded, setLoaded] = React.useState(false);

  // Best-effort: if the API is unreachable we keep the fallback (which is
  // exactly the seed data the backend writes for Vera anyway), so the section
  // looks identical online or offline.
  React.useEffect(() => {
    let cancelled = false;
    getAvatarConfig("vera")
      .then((cfg) => {
        if (cancelled) return;
        setConfig({
          visual_prompt: cfg.visual_prompt || FALLBACK.visual_prompt,
          motion_prompt: cfg.motion_prompt || FALLBACK.motion_prompt,
        });
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="vera"
      className="relative w-full overflow-hidden px-4 py-24 sm:px-6 sm:py-32"
    >
      {/* Ambient field — a deep, off-center primary glow that anchors the
          section visually without competing with the lamp above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-12 -z-10 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"
      />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-start gap-3 sm:items-center sm:text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.62rem] uppercase tracking-[0.4em] text-white/55 sm:text-[0.65rem]">
            <Sparkles className="h-3 w-3 text-primary" />
            avatar 01
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            Meet{" "}
            <span className="font-cursive text-5xl text-primary sm:text-6xl md:text-7xl">
              Vera
            </span>
          </h2>
          <p className="max-w-2xl text-balance text-base text-white/55 sm:text-lg">
            A hyper-realistic AI talent designed for social-first content.
            Vera's identity lives in Postgres — every generation starts from
            the same prompt, every time.
          </p>
        </motion.div>

        {/* Bento grid: portrait + stats + prompt panels + trait sheet. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <PortraitCard className="md:col-span-5 md:row-span-2" />

          <PromptPanel
            className="md:col-span-7"
            title="Visual prompt"
            badge="DALL·E 3"
            badgeIcon={Quote}
            text={config.visual_prompt}
            loaded={loaded}
          />

          <TraitsCard className="md:col-span-4" />

          <PromptPanel
            className="md:col-span-3"
            title="Motion prompt"
            badge="Seedance"
            badgeIcon={Quote}
            text={config.motion_prompt}
            loaded={loaded}
            condensed
          />
        </div>

        {/* Stat trio underneath. */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {STAT_CARDS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6"
            >
              <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/40">
                {stat.label}
              </p>
              <p className="mt-3 font-semibold text-white text-3xl sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-white/45">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Quiet edit affordance — links to the settings page where these
            prompts are actually mutable. */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white/85"
          >
            <Pencil className="h-3 w-3" />
            Edit Vera's templates
          </Link>
        </div>
      </div>
    </section>
  );
}

function PortraitCard({ className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01]",
        // On mobile keep a portrait aspect so it's still imposing without
        // pushing the rest of the section off-screen.
        "min-h-[320px] sm:min-h-[420px] md:min-h-[unset]",
        className,
      )}
    >
      {/* Stylized "portrait" — pure gradient. Reads as a moody studio shot
          without needing real Vera renders to ship in first. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 35%, rgba(120,170,255,0.55) 0%, rgba(40,60,120,0.3) 35%, transparent 75%), radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.95) 30%, transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            "radial-gradient(50% 80% at 50% 0%, rgba(160,200,255,0.45) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.96), transparent)",
        }}
      />

      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-white/85">
        <div>
          <p className="font-cursive text-5xl leading-none text-white sm:text-6xl">
            Vera
          </p>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-white/45 sm:text-[0.65rem]">
            avatar_id · vera
          </p>
        </div>
        <div className="text-right font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/45 sm:text-[0.65rem]">
          <p>v1.0</p>
          <p className="text-emerald-400/80">live</p>
        </div>
      </div>

      {/* Top-left identity chip */}
      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Vera · ready
      </div>
    </motion.div>
  );
}

function PromptPanel({
  className,
  title,
  badge,
  badgeIcon: BadgeIcon,
  text,
  loaded,
  condensed = false,
}) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* Clipboard blocked — silently no-op */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.35em] text-white/45 sm:text-[0.65rem]">
          {BadgeIcon && <BadgeIcon className="h-3 w-3 text-primary" />}
          {title}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.3em] text-white/45">
            {badge}
          </span>
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copy ${title}`}
            className="rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-300" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      <p
        className={cn(
          "mt-4 font-mono text-sm leading-relaxed text-white/80",
          condensed && "line-clamp-6",
        )}
      >
        {text}
        {loaded ? null : (
          <span className="ml-1 inline-block h-3 w-3 animate-pulse rounded-full bg-white/15 align-middle" />
        )}
      </p>

      {/* Subtle hover glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, hsl(var(--primary) / 0.18), transparent 35%, transparent 65%, hsl(var(--primary) / 0.12))",
          mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          WebkitMask:
            "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
    </motion.div>
  );
}

function TraitsCard({ className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6",
        className,
      )}
    >
      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/45 sm:text-[0.65rem]">
        Trait sheet
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-y-3">
        {TRAITS.map((trait) => (
          <div
            key={trait.label}
            className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
              {trait.label}
            </dt>
            <dd className="text-sm text-white/85">{trait.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
