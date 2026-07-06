"use client";

import { useEffect, type RefObject } from "react";

/**
 * Mouse click-and-drag panning for a horizontal scroller.
 * Touch is untouched — it already pans natively.
 *
 * A real drag swallows the click that follows it (so cards/links don't
 * navigate), but only when the drag ends in a pointerup — a cancelled drag
 * must not eat the user's next legitimate click.
 */
export function useDragPan(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let down = false;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      dragging = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6) return;
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      e.preventDefault();
      el.scrollLeft = startLeft - dx;
    };
    const end = (e: PointerEvent) => {
      down = false;
      el.style.cursor = "";
      el.style.userSelect = "";
      if (dragging && e.type === "pointerup") {
        const swallow = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        el.addEventListener("click", swallow, { capture: true, once: true });
        // The click (if any) fires synchronously after pointerup; clear the
        // trap right after so it can never eat a later, real click.
        setTimeout(
          () => el.removeEventListener("click", swallow, { capture: true }),
          0
        );
      }
      dragging = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, [ref]);
}
