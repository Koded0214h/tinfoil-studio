import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function Navbar() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 120], [0, 1]);
  const blur = useTransform(scrollY, [0, 120], [0, 14]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  const location = useLocation();
  const onLanding = location.pathname === "/home";

  const [open, setOpen] = React.useState(false);

  // Close the mobile sheet on route change (otherwise it lingers behind the
  // new page if the user taps a link inside it).
  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile sheet is open so the page underneath
  // doesn't drift around.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-5">
      <motion.div
        className="pointer-events-auto relative flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-xl sm:px-5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <motion.div
          aria-hidden="true"
          style={{ opacity, backdropFilter: filter }}
          className="absolute inset-0 -z-10 rounded-full bg-black/30"
        />

        <Link to="/home" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/40 text-[0.7rem] font-bold text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
            t
          </span>
          <span className="text-sm font-medium tracking-tight text-white">
            Tinfoil<span className="text-white/40">-Studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/65 md:flex">
          <RouteLink to="/home" active={onLanding}>
            Home
          </RouteLink>
          <RouteLink to="/prompt" active={location.pathname === "/prompt"}>
            Brief
          </RouteLink>
          <RouteLink to="/history" active={location.pathname === "/history"}>
            History
          </RouteLink>
          <RouteLink to="/settings" active={location.pathname === "/settings"}>
            Settings
          </RouteLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/prompt"
            className={cn(
              "hidden rounded-full px-3.5 py-1.5 text-xs font-medium text-white sm:inline-block",
              "bg-primary/90 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_8px_30px_-10px_hsl(var(--primary)/0.7)] transition-colors hover:bg-primary",
            )}
          >
            Get Started
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-colors hover:bg-white/10 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-sheet"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute left-3 right-3 top-[calc(100%+8px)] rounded-2xl border border-white/10 bg-black/85 p-3 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col">
              <MobileLink to="/home">Home</MobileLink>
              <MobileLink to="/prompt">Brief</MobileLink>
              <MobileLink to="/history">History</MobileLink>
              <MobileLink to="/settings">Settings</MobileLink>
              <Link
                to="/prompt"
                className={cn(
                  "mt-2 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white",
                  "bg-primary/90 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_8px_30px_-10px_hsl(var(--primary)/0.7)] transition-colors hover:bg-primary",
                )}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function RouteLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative transition-colors hover:text-white",
        active && "text-white",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-px bg-gradient-to-r from-primary to-transparent transition-all duration-300",
          active ? "w-full" : "w-0 group-hover:w-full",
        )}
      />
    </Link>
  );
}

function MobileLink({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
