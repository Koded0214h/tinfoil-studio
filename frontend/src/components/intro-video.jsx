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
 *
 * On desktop the video covers the full viewport. On mobile it centers at a
 * comfortable size on a black canvas, since a full-bleed cover-fit crops the
 * collision moment and feels claustrophobic on small screens.
 *
 * Once the video ends, `onReady` fires so the parent can enable tap-to-enter.
 */
export function IntroVideo({ className, onReady, onTap, canTap }) {
  const videoRef = React.useRef(null);
  // Stash the latest onReady in a ref so the effect doesn't have to depend on
  // it (and re-run, replaying the video) when the parent re-renders.
  const onReadyRef = React.useRef(onReady);
  React.useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const [showWordmark, setShowWordmark] = React.useState(false);
  const [glowSettled, setGlowSettled] = React.useState(false);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTime = () => {
      if (v.currentTime >= REVEAL_AT_SECONDS) {
        // Idempotent — React skips re-renders when the next state equals the
        // previous one, so we don't need a guard here.
        setShowWordmark(true);
      }
    };
    const handleEnded = () => {
      setGlowSettled(true);
      onReadyRef.current?.();
    };
    const handleError = () => {
      setShowWordmark(true);
      setGlowSettled(true);
      onReadyRef.current?.();
    };

    v.addEventListener("timeupdate", handleTime);
    v.addEventListener("ended", handleEnded);
    v.addEventListener("error", handleError);

    // Only kick off playback if the video is actually fresh. Without this
    // guard, React 18 StrictMode (which intentionally double-invokes mount
    // effects in dev) calls play() a second time AFTER the video has already
    // ended on the first run, restarting the video while "tap to enter" is
    // already visible.
    if (v.paused && v.currentTime === 0 && !v.ended) {
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          setShowWordmark(true);
          setGlowSettled(true);
          onReadyRef.current?.();
        });
      }
    } else if (v.ended) {
      // The first effect run already played the video to completion; just
      // reflect that state in the new effect run.
      setShowWordmark(true);
      setGlowSettled(true);
      onReadyRef.current?.();
    }

    return () => {
      v.removeEventListener("timeupdate", handleTime);
      v.removeEventListener("ended", handleEnded);
      v.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <section
      className={cn(
        "relative isolate flex h-[100svh] min-h-[560px] w-full select-none items-center justify-center overflow-hidden bg-black",
        canTap && "cursor-pointer",
        className,
      )}
      aria-label="Vera — brand intro"
      role={canTap ? "button" : undefined}
      tabIndex={canTap ? 0 : undefined}
      onClick={canTap ? onTap : undefined}
      onKeyDown={
        canTap
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onTap?.();
              }
            }
          : undefined
      }
    >
      {/* Edge bleed: fades any rectangular video boundary into the page. */}
      <div className="pointer-events-none absolute inset-0 z-10 video-seam" />

      {/* Mobile: video sits inside a generous frame so it reads as the focal
          object on a black page. Desktop: object-cover for full-bleed cinema. */}
      <div className="relative z-0 flex h-full w-full items-center justify-center">
        <video
          ref={videoRef}
          src={introMp4}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          aria-hidden="true"
          className={cn(
            "block max-h-[78svh] w-auto max-w-[95vw] object-contain",
            "sm:max-h-[88svh]",
            "md:absolute md:inset-0 md:h-full md:w-full md:max-h-none md:max-w-none md:object-cover",
          )}
        />
      </div>

      <AnimatePresence>
        {showWordmark && (
          <motion.div
            key="wordmark"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4"
          >
            <h1
              className="font-cursive text-[26vw] leading-[0.9] text-white sm:text-[18vw] md:text-[14rem] lg:text-[15rem]"
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

      {/* Tap-to-enter CTA appears once the video settles. */}
      <AnimatePresence>
        {glowSettled && (
          <motion.div
            key="tap-cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-0 bottom-[10%] z-30 flex flex-col items-center gap-3 px-6 sm:bottom-[14%]"
          >
            <span className="text-[0.6rem] uppercase tracking-[0.55em] text-white/55 sm:text-[0.68rem]">
              Tinfoil Studio · AI talent
            </span>
            <TapNudge />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TapNudge() {
  return (
    <div className="flex flex-col items-center gap-2 text-white/60">
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-[0.65rem] uppercase tracking-[0.45em] sm:text-xs"
      >
        Tap to enter
      </motion.span>
      <motion.span
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(120,180,255,0.6)",
            "0 0 0 12px rgba(120,180,255,0)",
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        className="block h-2 w-2 rounded-full bg-white/80"
      />
    </div>
  );
}
