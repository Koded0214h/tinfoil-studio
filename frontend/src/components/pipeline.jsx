import * as React from "react";
import { motion } from "framer-motion";
import {
  PencilLine,
  Image as ImageIcon,
  Boxes,
  Film,
  Share2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  {
    Icon: PencilLine,
    label: "Brief",
    detail: "Text prompt or reference image",
    sub: "operator",
  },
  {
    Icon: ImageIcon,
    label: "Image",
    detail: "DALL·E 3 with Vera's visual prompt",
    sub: "≈ 8s",
  },
  {
    Icon: Boxes,
    label: "3D Model",
    detail: "Tripo3D — optional",
    sub: "2–5 min",
    optional: true,
  },
  {
    Icon: Film,
    label: "Video",
    detail: "Seedance 2.0 via fal.ai",
    sub: "9:16 · 5–15s",
  },
  {
    Icon: Share2,
    label: "Post",
    detail: "Upload-Post → Instagram / TikTok",
    sub: "auto",
  },
];

export function Pipeline() {
  return (
    <section
      id="pipeline"
      className="relative w-full px-6 pb-32 pt-24 sm:pt-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col items-start gap-3 sm:items-center sm:text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-white/55">
            Pipeline
          </span>
          <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            From brief to posted clip
            <span className="text-white/40"> — without you in the loop.</span>
          </h2>
          <p className="max-w-2xl text-base text-white/55">
            One avatar, one operator, one click. Every step is asynchronous,
            tracked in Postgres, and visible from the dashboard.
          </p>
        </div>

        <ol className="relative grid gap-4 md:grid-cols-5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block"
          />
          {STEPS.map((step, index) => (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex flex-col items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm md:items-center md:text-center"
            >
              <div
                className={cn(
                  "relative grid h-12 w-12 place-items-center rounded-full border",
                  step.optional
                    ? "border-white/10 bg-white/[0.04] text-white/70"
                    : "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                <step.Icon className="h-5 w-5" />
                {!step.optional && (
                  <span className="absolute -inset-1 -z-10 rounded-full bg-primary/30 blur-lg" />
                )}
              </div>
              <div className="md:space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium text-white md:justify-center">
                  {step.label}
                  {step.optional && (
                    <span className="rounded-full border border-white/15 px-1.5 py-px text-[0.55rem] uppercase tracking-[0.2em] text-white/55">
                      opt
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/55">{step.detail}</p>
                <p className="font-mono text-[0.7rem] text-white/35">
                  {step.sub}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
