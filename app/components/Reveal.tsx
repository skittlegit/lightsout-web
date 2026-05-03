"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Stagger offset in ms for sequential sections. */
  delay?: number;
  className?: string;
}

/**
 * Subtle in-view reveal: opacity 0->1, translateY 12->0, 700ms.
 * Used by major sections only.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 0.61, 0.36, 1],
        delay: delay / 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
