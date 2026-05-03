import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const STREAK_COUNT = 18;
const PARTICLE_COUNT = 28;

/**
 * The "collision" — a deliberate echo of the convergence at 5.5s of the intro
 * video. Three layered phases:
 *
 *   1. Streaks lance in from off-screen toward dead center.
 *   2. White-blue impact: a tiny hot core blooms into a full-screen radial.
 *   3. White flash peaks; we hand off to the next page underneath.
 *
 * Total runtime ~1.6s; navigate at ~0.95s (the white peak) so the new page
 * paints behind the flash and we read as one continuous moment, not a cut.
 */
export function CollisionFlash({ className, onPeak, onComplete }) {
  const streaks = React.useMemo(
    () =>
      Array.from({ length: STREAK_COUNT }, (_, i) => ({
        angle: (360 / STREAK_COUNT) * i + (Math.random() * 14 - 7),
        length: 60 + Math.random() * 40, // % of vmax
        thickness: 1 + Math.random() * 1.5,
        delay: Math.random() * 0.18,
      })),
    [],
  );

  const particles = React.useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        startX: (Math.random() - 0.5) * 220, // % offset
        startY: (Math.random() - 0.5) * 220,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.25,
      })),
    [],
  );

  const peakFiredRef = React.useRef(false);
  React.useEffect(() => {
    const peakAt = setTimeout(() => {
      if (!peakFiredRef.current) {
        peakFiredRef.current = true;
        onPeak?.();
      }
    }, 950);
    const completeAt = setTimeout(() => {
      onComplete?.();
    }, 1600);
    return () => {
      clearTimeout(peakAt);
      clearTimeout(completeAt);
    };
  }, [onPeak, onComplete]);

  return (
    <motion.div
      role="presentation"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black",
        className,
      )}
    >
      {/* Converging streaks — long thin gradients pointed at center */}
      {streaks.map((s, i) => (
        <motion.span
          key={`streak-${i}`}
          className="absolute left-1/2 top-1/2 origin-left rounded-full"
          style={{
            width: `${s.length}vmax`,
            height: `${s.thickness}px`,
            transform: `rotate(${s.angle}deg)`,
            background:
              "linear-gradient(to right, transparent 0%, rgba(120,170,255,0.2) 40%, rgba(160,210,255,0.95) 92%, #ffffff 100%)",
            filter: "blur(0.4px)",
          }}
          initial={{ scaleX: 0.05, opacity: 0 }}
          animate={{
            scaleX: [0.05, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.95,
            delay: s.delay,
            times: [0, 0.7, 1],
            ease: [0.7, 0, 0.3, 1],
          }}
        />
      ))}

      {/* Particles converging from random angles toward the impact point */}
      {particles.map((p, i) => (
        <motion.span
          key={`p-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full bg-blue-200"
          style={{ width: p.size, height: p.size, filter: "blur(0.5px)" }}
          initial={{
            x: `${p.startX}vmax`,
            y: `${p.startY}vmax`,
            opacity: 0,
          }}
          animate={{
            x: ["", "0vmax"],
            y: ["", "0vmax"],
            opacity: [0, 1, 0],
            scale: [1, 1.6, 0],
          }}
          transition={{
            duration: 0.95,
            delay: p.delay,
            times: [0, 0.85, 1],
            ease: [0.7, 0, 0.3, 1],
          }}
        />
      ))}

      {/* Impact core — a hot dot that blooms into a screen-filling glow */}
      <motion.span
        className="absolute rounded-full"
        initial={{
          width: 0,
          height: 0,
          opacity: 0,
        }}
        animate={{
          width: ["4px", "20px", "120vmax"],
          height: ["4px", "20px", "120vmax"],
          opacity: [0, 1, 1, 0],
          background: [
            "radial-gradient(circle, #ffffff 0%, #ffffff 70%, transparent 100%)",
            "radial-gradient(circle, #ffffff 0%, #b6d8ff 50%, rgba(56,128,238,0.9) 100%)",
            "radial-gradient(circle, rgba(255,255,255,0.0) 0%, rgba(120,180,255,0.55) 30%, rgba(40,100,220,0.0) 70%)",
          ],
        }}
        transition={{
          duration: 1.4,
          delay: 0.55,
          times: [0, 0.18, 0.55, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          boxShadow:
            "0 0 60px 20px rgba(160,210,255,0.55), 0 0 200px 80px rgba(60,130,240,0.45)",
        }}
      />

      {/* The white peak — a single hard flash that masks the navigation cut */}
      <motion.span
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.92, 0] }}
        transition={{
          duration: 1.0,
          delay: 0.6,
          times: [0, 0.25, 0.45, 1],
          ease: "easeOut",
        }}
      />

      {/* Final blue veil that fades away as the new page appears under it */}
      <motion.span
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(80,150,255,0.35) 0%, rgba(0,0,0,0.5) 60%, #000 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{
          duration: 0.9,
          delay: 0.8,
          times: [0, 0.4, 1],
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
}
