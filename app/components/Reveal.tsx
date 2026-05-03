"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Stagger offset in ms for sequential sections. */
  delay?: number;
  className?: string;
}

/**
 * Subtle in-view reveal: opacity 0->1, translateY 8->0, 520ms.
 * No-ops for users with prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px -8% 0px" });
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
        delay: delay / 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
