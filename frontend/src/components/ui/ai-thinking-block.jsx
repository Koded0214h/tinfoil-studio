import React from "react";
import { cn } from "@/lib/utils";

const VERA_THINKING = `Analyzing the scene brief and Vera's visual character profile...

Composing lighting setup — fashion editorial style, high contrast, dark studio atmosphere...

Matching Vera's distinctive features: sharp bone structure, dark hair, contemporary wardrobe palette...

Selecting optimal camera angle and depth of field for the 9:16 aspect ratio...

Building the environmental layer — atmosphere, texture, and ambient detail...

Applying cinematic color grading consistent with Vera's signature aesthetic...

Cross-referencing motion template library for social-native pacing...

Rendering initial composition at 1024×1024 with enhanced edge fidelity...

Evaluating framing against platform crop zones for Instagram safe-area compliance...

Fine-tuning shadow gradients and specular highlights on Vera's face and wardrobe...

Synthesizing final image — locking Vera's facial geometry and expression...

Passing to video pipeline for motion synthesis...`;

export function AIThinkingBlock({ label = "Vera is thinking", className }) {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [timer, setTimer] = React.useState(0);
  const contentRef = React.useRef(null);
  const scrollIntervalRef = React.useRef(null);

  React.useEffect(() => {
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    scrollIntervalRef.current = setInterval(() => {
      setScrollPosition((prev) => {
        const next = prev + 0.8;
        return next >= max ? 0 : next;
      });
    }, 16);
    return () => clearInterval(scrollIntervalRef.current);
  }, []);

  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Header row */}
      <div className="flex items-center gap-2.5">
        <SpinnerIcon className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
        <span
          className="text-sm font-medium"
          style={{
            background: "linear-gradient(110deg, #555 25%, #fff 50%, #555 75%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "vera-shimmer 3s linear infinite",
          }}
        >
          {label}
        </span>
        <span className="text-xs text-white/35 tabular-nums">{timer}s</span>
      </div>

      {/* Scrolling thought box */}
      <div className="relative h-[120px] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        {/* top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black/60 to-transparent" />
        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-black/60 to-transparent" />

        <div
          ref={contentRef}
          className="h-full overflow-hidden px-4 py-3"
          style={{ scrollBehavior: "auto" }}
        >
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-white/40">
            {VERA_THINKING}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes vera-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function SpinnerIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
