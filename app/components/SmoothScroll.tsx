"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Mounts a single Lenis instance for smooth scrolling.
 * Renders nothing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Respect reduced-motion users.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis();
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
