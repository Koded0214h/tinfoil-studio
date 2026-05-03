import * as React from "react";
import { GitHubMark } from "@/components/icons/brand-marks";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/40 text-[0.75rem] font-bold text-white">
            t
          </span>
          <div className="text-sm">
            <p className="font-medium tracking-tight text-white">
              tinfoil-studio
            </p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
              MVP · v1.0
            </p>
          </div>
        </div>
        <p className="max-w-xs text-xs text-white/40">
          A pipeline-first content platform. Brief in, social-ready video out.
        </p>
        <a
          href="https://github.com/koded/tinfoil-studio"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10"
        >
          <GitHubMark className="h-3.5 w-3.5" />
          github.com/koded/tinfoil-studio
        </a>
      </div>
    </footer>
  );
}
