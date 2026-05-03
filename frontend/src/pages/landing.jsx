import * as React from "react";

import { IntroVideo } from "@/components/intro-video";
import { Hero } from "@/components/blocks/hero";
import { PromptBox } from "@/components/prompt-box";
import { AvatarCard } from "@/components/avatar-card";
import { Pipeline } from "@/components/pipeline";

export default function LandingPage() {
  return (
    <>
      <IntroVideo />

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
        subtitle="tinfoil-studio turns a one-line brief into a 9:16 video posted to your socials — in under two hours, with zero manual hand-off. Vera is the face."
        actions={[
          { label: "Generate a clip", href: "#brief", variant: "default" },
          { label: "How it works", href: "#pipeline", variant: "outline" },
        ]}
      >
        <div id="brief" className="mt-16 w-full max-w-3xl">
          <PromptBox />
        </div>
      </Hero>

      <AvatarCard />
      <Pipeline />
    </>
  );
}
