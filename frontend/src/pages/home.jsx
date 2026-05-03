import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Hero } from "@/components/blocks/hero";
import { PromptBox } from "@/components/prompt-box";
import { MeetVera } from "@/components/meet-vera";
import { Pipeline } from "@/components/pipeline";

export default function HomePage() {
  return (
    <main className="relative w-full overflow-x-clip bg-background">
      <Hero
        eyebrow="brief in · social-ready clip out"
        title={
          <>
            AI talent.{" "}
            <span className="bg-gradient-to-br from-primary via-white to-primary/40 bg-clip-text text-transparent">
              Pipeline-first.
            </span>
          </>
        }
        subtitle="Tinfoil Studio turns a one-line brief into a 9:16 video posted to your socials — in under two hours, with zero manual hand-off. Vera is the face."
        actions={[
          { label: "Brief Vera", href: "#brief", variant: "default" },
          { label: "Meet Vera", href: "#vera", variant: "outline" },
        ]}
        footnote="Image · 3D model · video · post — one operator, one click."
      />

      <BriefSection />
      <MeetVera />
      <Pipeline />
    </main>
  );
}

function BriefSection() {
  return (
    <section
      id="brief"
      className="relative w-full overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28"
    >
      {/* Soft top fade so the lamp's glow reads as bleeding into this section
          rather than terminating at a hard edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-32 bg-gradient-to-b from-transparent via-primary/[0.05] to-transparent"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center"
      >
        <ChevronDown
          className="h-4 w-4 animate-pulse-soft text-white/30"
          aria-hidden="true"
        />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.62rem] uppercase tracking-[0.4em] text-white/55 sm:text-[0.65rem]">
          Brief
        </span>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          What should{" "}
          <span className="font-cursive text-4xl text-primary sm:text-5xl md:text-6xl">
            Vera
          </span>{" "}
          make?
        </h2>
        <p className="max-w-xl text-balance text-sm text-white/55 sm:text-base">
          One line. One click. Vera turns it into a fully rendered 9:16 clip
          and posts it for you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-12 w-full max-w-3xl"
      >
        <PromptBox />
      </motion.div>
    </section>
  );
}
