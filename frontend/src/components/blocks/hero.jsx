import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Hero = React.forwardRef(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      eyebrow,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      children,
      footnote,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative z-0 flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-background",
          className,
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            {/* Main glow — slightly hotter on desktop than the original to
                give the standalone hero more presence. */}
            <div className="absolute inset-auto z-50 h-36 w-[20rem] -translate-y-[-30%] rounded-full bg-primary/70 opacity-90 blur-3xl sm:w-[28rem] md:w-[34rem]" />

            {/* Lamp pulse */}
            <motion.div
              initial={{ width: "8rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.9 }}
              whileInView={{ width: "20rem" }}
              className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
            />

            {/* Top line */}
            <motion.div
              initial={{ width: "10rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.9 }}
              whileInView={{ width: "36rem" }}
              className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-primary/70"
            />

            {/* Left gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "12rem" }}
              whileInView={{ opacity: 1, width: "36rem" }}
              transition={{ delay: 0.3, duration: 0.9, ease: "easeInOut" }}
              style={{
                backgroundImage:
                  "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
              }}
              className="absolute inset-auto right-1/2 h-64 w-[30rem] overflow-visible bg-gradient-conic from-primary/70 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
            >
              <div className="absolute bottom-0 left-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="absolute bottom-0 left-0 z-20 h-[100%] w-40 bg-background [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "12rem" }}
              whileInView={{ opacity: 1, width: "36rem" }}
              transition={{ delay: 0.3, duration: 0.9, ease: "easeInOut" }}
              style={{
                backgroundImage:
                  "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
              }}
              className="absolute inset-auto left-1/2 h-64 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary/70 [--conic-position:from_290deg_at_center_top]"
            >
              <div className="absolute bottom-0 right-0 z-20 h-[100%] w-40 bg-background [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="absolute bottom-0 right-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ y: 80, opacity: 0 }}
          viewport={{ once: true }}
          transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.45, duration: 0.9 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="container relative z-50 flex flex-1 -translate-y-12 flex-col justify-center gap-8 px-5 pb-12 pt-24 md:px-10 md:pt-32"
        >
          <div className="flex flex-col items-center space-y-6 text-center">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.4em] text-white/70 backdrop-blur sm:text-[0.7rem]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                {eyebrow}
              </span>
            )}
            <h1
              className={cn(
                "max-w-5xl text-balance bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-4xl font-semibold tracking-tight text-transparent",
                "sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "max-w-2xl text-balance text-base text-white/60 sm:text-lg md:text-xl",
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            )}
            {actions && actions.length > 0 && (
              <div
                className={cn(
                  "mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center",
                  actionsClassName,
                )}
              >
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size={action.size || "lg"}
                    asChild
                  >
                    {action.to ? (
                      <Link to={action.to}>{action.label}</Link>
                    ) : (
                      <a href={action.href}>{action.label}</a>
                    )}
                  </Button>
                ))}
              </div>
            )}
            {children}
            {footnote && (
              <p className="mt-6 max-w-md text-xs text-white/35">{footnote}</p>
            )}
          </div>
        </motion.div>
      </section>
    );
  },
);
Hero.displayName = "Hero";

export { Hero };
