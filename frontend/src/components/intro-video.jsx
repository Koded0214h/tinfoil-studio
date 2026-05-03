import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import introMp4 from "@/assets/intro.mp4";
import { cn } from "@/lib/utils";

const REVEAL_AT_SECONDS = 5.5;

/**
 * The brand-load intro. Plays once on mount over a true-black canvas so the
 * video edges are indistinguishable from the page background. At 5.5s — the
 * exact frame the collision resolves into the blue flash — the Vera wordmark
 * fades in inside that glow.
 */
export function IntroVideo({ className, onComplete }) {
  const videoRef = React.useRef(null);
  const [showWordmark, setShowWordmark] = React.useState(false);
  const [glowSettled, setGlowSettled] = React.useState(false);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTime = () => {
      if (v.currentTime >= REVEAL_AT_SECONDS && !showWordmark) {
        setShowWordmark(true);
      }
    };
    const handleEnded = () => {
      setGlowSettled(true);
      onComplete?.();
    };
    const handleError = () => {
      // Graceful fallback: if the video can't play we still ship the wordmark
      // so the page doesn't read as broken.
      setShowWordmark(true);
      setGlowSettled(true);
    };

    v.addEventListener("timeupdate", handleTime);
    v.addEventListener("ended", handleEnded);
    v.addEventListener("error", handleError);

    const playPromise = v.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay blocked (rare with muted+playsInline). Reveal Vera anyway.
        setShowWordmark(true);
      });
    }

    return () => {
      v.removeEventListener("timeupdate", handleTime);
      v.removeEventListener("ended", handleEnded);
      v.removeEventListener("error", handleError);
    };
  }, [onComplete, showWordmark]);

  return (
    <section
      className={cn(
        "relative isolate flex h-[100svh] min-h-[680px] w-full items-center justify-center overflow-hidden bg-black",
        className,
      )}
      aria-label="Vera — brand intro"
    >
      {/* Edge bleed: a subtle radial that ensures the rectangular video can
          never produce a visible boundary against the page, even on ultrawide. */}
      <div className="pointer-events-none absolute inset-0 z-10 video-seam" />

      <video
        ref={videoRef}
        src={introMp4}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        className="absolute inset-0 z-0 h-full w-full object-cover"
        aria-hidden="true"
      />

      <AnimatePresence>
        {showWordmark && (
          <motion.div
            key="wordmark"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <h1
              className="font-cursive select-none text-[22vw] leading-[0.9] text-white sm:text-[16vw] md:text-[12rem] lg:text-[14rem]"
              style={{
                textShadow:
                  "0 0 22px rgba(120,180,255,0.85), 0 0 60px rgba(70,140,255,0.65), 0 0 140px rgba(50,110,240,0.45)",
              }}
            >
              Vera
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tagline that fades in once the wordmark settles, telling the visitor
          this is a brand — not a stuck loading screen. */}
      <AnimatePresence>
        {glowSettled && (
          <motion.div
            key="tag"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-0 bottom-[14%] z-30 flex flex-col items-center gap-3"
          >
            <span className="text-[0.68rem] uppercase tracking-[0.55em] text-white/55">
              tinfoil-studio · AI talent
            </span>
            <ScrollNudge />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ScrollNudge() {
  return (
    <div className="flex flex-col items-center gap-2 text-white/40">
      <span className="text-[0.6rem] uppercase tracking-[0.4em]">scroll</span>
      <span className="block h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
    </div>
  );
}
