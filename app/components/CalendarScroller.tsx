"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDragPan } from "./useDragPan";

interface Props {
  children: React.ReactNode;
  ariaLabel: string;
}

/**
 * Horizontal scroller for the season calendar.
 *
 * The strip lives behind a hidden scrollbar, so on desktop a vertical mouse
 * wheel has no way to move it. This wraps the strip with the affordances that
 * make it reachable:
 *   • prev / next arrow buttons (pointer + keyboard)
 *   • vertical wheel → horizontal scroll (without trapping the page at edges)
 *   • click-and-drag to pan with a mouse
 *   • ← / → keys when the strip is focused
 *   • auto-centres the next race on mount so you land where it matters
 *   • edge fades that appear only where more rounds exist
 *   • a thin progress rule that doubles as a "there's more →" hint
 *
 * Scroll snap is disabled for fine pointers in CSS (`.scroll-snap-x`): the
 * wheel/drag handlers pan by assigning scrollLeft, and re-snapping after each
 * assignment made the strip judder and the last rounds unreachable.
 */
export default function CalendarScroller({ children, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setAtStart(left <= 1);
    setAtEnd(left >= max - 1);
    setProgress(max > 0 ? Math.min(1, Math.max(0, left / max)) : 0);
  }, []);

  // Keep arrow/progress state in sync with scroll position and size changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    // The track can widen without the container resizing (fonts, data).
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  // Land on the upcoming race instead of round 1.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = el.querySelector<HTMLElement>("[data-next='true']");
    if (next) {
      const target = next.offsetLeft - el.clientWidth / 2 + next.clientWidth / 2;
      el.scrollLeft = Math.max(0, target);
    }
    sync();
  }, [sync]);

  // Vertical wheel → horizontal pan. Only hijack when there's room to move in
  // that direction, so the page still scrolls normally at the strip's edges.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      // Horizontal intent (trackpad / shift-wheel) is already handled natively.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // Normalise: Firefox reports line (1) / page (2) deltas, not pixels.
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= el.clientWidth;
      if (delta === 0) return;
      const left = el.scrollLeft;
      if ((delta < 0 && left <= 0) || (delta > 0 && left >= max - 1)) return;
      e.preventDefault();
      el.scrollLeft = left + delta;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Click-and-drag to pan (mouse only — touch already pans natively).
  useDragPan(ref);

  const nudge = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-1);
    }
  };

  return (
    <div className="relative -mx-[var(--gutter-x)]">
      <ArrowButton dir="left" hidden={atStart} onClick={() => nudge(-1)} />
      <ArrowButton dir="right" hidden={atEnd} onClick={() => nudge(1)} />

      <div className="relative">
        <div
          ref={ref}
          data-lenis-prevent
          role="region"
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label={`${ariaLabel} (scrollable — use arrow keys, drag, or scroll)`}
          className="overflow-x-auto no-scrollbar scroll-snap-x px-[var(--gutter-x)] pb-2 cursor-grab focus-visible:outline-none"
        >
          {/* role="list" restores semantics Safari drops from display:flex lists */}
          <ul role="list" className="flex gap-3 min-w-max">{children}</ul>
        </div>

        {/* Edge fades — only where more rounds exist, so the first and last
            cards are fully visible once you've reached them. */}
        <span
          aria-hidden
          className="hscroll-fade hscroll-fade--l"
          style={{ opacity: atStart ? 0 : 1 }}
        />
        <span
          aria-hidden
          className="hscroll-fade hscroll-fade--r"
          style={{ opacity: atEnd ? 0 : 1 }}
        />
      </div>

      {/* Progress rule — fills as you move, hints that more rounds exist. */}
      <div
        aria-hidden
        className="mx-[var(--gutter-x)] mt-3 h-px bg-rule overflow-hidden"
      >
        <div
          className="h-full bg-f1 origin-left transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${Math.max(0.04, progress)})` }}
        />
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  hidden,
  onClick,
}: {
  dir: "left" | "right";
  hidden: boolean;
  onClick: () => void;
}) {
  const left = dir === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={left ? "Previous rounds" : "Next rounds"}
      tabIndex={hidden ? -1 : 0}
      className={`hidden md:grid place-items-center absolute top-[calc(50%-12px)] -translate-y-1/2 z-10 w-10 h-10 bg-paper/90 backdrop-blur-sm border border-rule text-ink transition-all duration-200 hover:border-ink hover:bg-paper ${
        left ? "left-2" : "right-2"
      } ${hidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d={left ? "M9 2 L4 7 L9 12" : "M5 2 L10 7 L5 12"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
