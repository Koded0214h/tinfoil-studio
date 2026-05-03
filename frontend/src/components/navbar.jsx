import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

export function Navbar() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 120], [0, 1]);
  const blur = useTransform(scrollY, [0, 120], [0, 14]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const location = useLocation();
  const onLanding = location.pathname === "/";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <motion.div
        className="pointer-events-auto relative flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-2.5 backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
      >
        <motion.div
          aria-hidden="true"
          style={{ opacity, backdropFilter: filter }}
          className="absolute inset-0 -z-10 rounded-full bg-black/30"
        />

        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/40 text-[0.7rem] font-bold text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
            t
          </span>
          <span className="text-sm font-medium tracking-tight text-white">
            tinfoil<span className="text-white/40">-studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/65 md:flex">
          {onLanding ? (
            <>
              <AnchorLink href="#vera">Vera</AnchorLink>
              <AnchorLink href="#pipeline">Pipeline</AnchorLink>
              <AnchorLink href="#brief">Brief</AnchorLink>
            </>
          ) : (
            <RouteLink to="/">Home</RouteLink>
          )}
          <RouteLink to="/history">History</RouteLink>
          <RouteLink to="/settings">Settings</RouteLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/history"
            className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/75 transition-colors hover:bg-white/10 sm:inline-block"
          >
            Jobs
          </Link>
          <Link
            to="/prompt"
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium text-white",
              "bg-primary/90 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_8px_30px_-10px_hsl(var(--primary)/0.7)] transition-colors hover:bg-primary",
            )}
          >
            Get Started
          </Link>
        </div>
      </motion.div>
    </header>
  );
}

function AnchorLink({ href, children }) {
  return (
    <a href={href} className="group relative transition-colors hover:text-white">
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

function RouteLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative transition-colors hover:text-white"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
