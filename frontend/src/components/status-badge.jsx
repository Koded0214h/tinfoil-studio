import * as React from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  PENDING: "bg-white/10 text-white/70 border-white/10",
  GENERATING_IMAGE: "bg-blue-500/15 text-blue-200 border-blue-400/30",
  GENERATING_3D: "bg-violet-500/15 text-violet-200 border-violet-400/30",
  GENERATING_VIDEO: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
  VIDEO_READY: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  POSTED: "bg-emerald-500/25 text-emerald-100 border-emerald-400/40",
  FAILED: "bg-red-500/15 text-red-200 border-red-400/30",
};

const LABELS = {
  PENDING: "Queued",
  GENERATING_IMAGE: "Generating image",
  GENERATING_3D: "Building 3D model",
  GENERATING_VIDEO: "Rendering video",
  VIDEO_READY: "Video ready",
  POSTED: "Posted",
  FAILED: "Failed",
};

export function StatusBadge({ status, className, label }) {
  const tone = VARIANTS[status] || VARIANTS.PENDING;
  const text = label || LABELS[status] || status;
  const live =
    status &&
    status !== "VIDEO_READY" &&
    status !== "POSTED" &&
    status !== "FAILED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tracking-tight",
        tone,
        className,
      )}
    >
      {live && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {text}
    </span>
  );
}
