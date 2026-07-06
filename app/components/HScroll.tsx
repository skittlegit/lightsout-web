"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDragPan } from "./useDragPan";

interface Props {
  children: React.ReactNode;
  /** Accessible name for the scrollable region. */
  ariaLabel: string;
  /** Classes for the outer wrapper (margins etc.). */
  className?: string;
  /** Full-bleed through the page gutters on small screens. */
  bleed?: boolean;
  /** Hide the left edge fade (when a sticky column owns that edge). */
  noFadeLeft?: boolean;
}

/**
 * Horizontal scroll container for wide content (tables, matrices).
 *
 * The old `overflow-x-auto no-scrollbar` wrappers left mouse users with no
 * way to reach overflowing columns. This restores every input path without
 * trapping page scroll:
 *   • thin themed scrollbar (the honest affordance)
 *   • click-and-drag panning for mouse
 *   • ← / → / Home / End keys when focused
 *   • edge fades that appear only where more content exists, so
 *     fully-scrolled content is never veiled
 * Vertical wheel is deliberately left alone — the page keeps scrolling.
 */
export default function HScroll({
  children,
  ariaLabel,
  className = "",
  bleed = false,
  noFadeLeft = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    // Content can widen without the container resizing (fonts, data).
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  useDragPan(ref);

  const scrollable = canLeft || canRight;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = ref.current;
    if (!el || !scrollable) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      el.scrollBy({ left: el.clientWidth * 0.6, behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      el.scrollBy({ left: -el.clientWidth * 0.6, behavior: "smooth" });
    } else if (e.key === "Home") {
      e.preventDefault();
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (e.key === "End") {
      e.preventDefault();
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`relative ${bleed ? "-mx-[var(--gutter-x)] md:mx-0" : ""} ${className}`}
    >
      <div
        ref={ref}
        data-lenis-prevent
        role="region"
        aria-label={ariaLabel}
        tabIndex={scrollable ? 0 : -1}
        onKeyDown={onKeyDown}
        className={`hscroll overflow-x-auto ${
          bleed ? "px-[var(--gutter-x)] md:px-0" : ""
        } ${scrollable ? "cursor-grab" : ""}`}
      >
        {children}
      </div>
      {!noFadeLeft && (
        <span
          aria-hidden
          className="hscroll-fade hscroll-fade--l"
          style={{ opacity: canLeft ? 1 : 0 }}
        />
      )}
      <span
        aria-hidden
        className="hscroll-fade hscroll-fade--r"
        style={{ opacity: canRight ? 1 : 0 }}
      />
    </div>
  );
}
