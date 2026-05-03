import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const TRAITS = [
  { label: "Look", value: "Hyper-real · editorial" },
  { label: "Lighting", value: "Dark studio · cold rim" },
  { label: "Wardrobe", value: "Contemporary · sharp" },
  { label: "Pacing", value: "Slow push-in · cinematic" },
  { label: "Format", value: "9:16 · social-native" },
];

export function AvatarCard() {
  return (
    <section
      id="vera"
      className="relative w-full overflow-hidden px-6 py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-white/55">
            <Sparkles className="h-3 w-3 text-primary" />
            avatar 01
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Meet{" "}
            <span className="font-cursive text-5xl text-primary sm:text-6xl">
              Vera
            </span>
          </h2>
          <p className="max-w-md text-base text-white/60">
            A hyper-realistic AI talent designed for social-first content.
            Vera's visual and motion templates are pinned in the database — every
            generation starts from the same identity, every time.
          </p>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {TRAITS.map((trait) => (
              <div
                key={trait.label}
                className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2"
              >
                <dt className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
                  {trait.label}
                </dt>
                <dd className="text-sm text-white/85">{trait.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01]"
        >
          {/* Stylized "portrait" using gradients only — no stock image needed.
              The PRD calls for dark studio editorial: this matches that mood
              while we wait for real Vera renders to ship in. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 35%, rgba(120,170,255,0.45) 0%, rgba(40,60,120,0.25) 35%, transparent 75%), radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.9) 30%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
            }}
          />

          <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-white/85">
            <div>
              <p className="font-cursive text-4xl leading-none text-white">
                Vera
              </p>
              <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
                avatar_id · vera
              </p>
            </div>
            <div className="text-right font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
              <p>v1.0</p>
              <p className="text-emerald-400/80">live</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
