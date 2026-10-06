"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Anchor {
  id: string;
  href: `#${string}`;
  label: string;
}

const ANCHORS: Anchor[] = [
  { id: "hero",         href: "#hero",         label: "01 · Top" },
  { id: "next",         href: "#next",         label: "02 · Next Race" },
  { id: "calendar",     href: "#calendar",     label: "03 · Calendar" },
  { id: "drivers",      href: "#drivers",      label: "04 · Drivers" },
  { id: "constructors", href: "#constructors", label: "05 · Constructors" },
  { id: "paddock",      href: "#paddock",      label: "06 · Paddock" },
  { id: "forecast",     href: "#forecast",     label: "07 · Forecast" },
];

/**
 * Vertical section nav. Highlights the section currently in view.
 * Hidden below xl. Pointer-only — keyboard users follow the in-flow links.
 */
export default function SectionAnchors() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const elements = ANCHORS.map((a) => document.getElementById(a.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // pick the topmost intersecting entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // A dot rail, not a text column: at xl widths the page gutter is narrower
  // than the labels, so labels only surface on hover/focus, over a paper chip.
  return (
    <nav
      aria-label="Section navigation"
      className="hidden xl:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-0.5"
    >
      {ANCHORS.map((a) => {
        const isActive = active === a.id;
        return (
          <a
            key={a.href}
            href={a.href}
            className="rail-link"
            data-active={isActive || undefined}
            aria-current={isActive ? "true" : undefined}
          >
            <span aria-hidden className="rail-dot" />
            <span className="rail-label">{a.label}</span>
          </a>
        );
      })}

      {/* Separate routed tools (not in-page sections). */}
      <span aria-hidden className="my-1.5 ml-[5px] h-px w-3 bg-rule" />
      <Link href="/compare" className="rail-link rail-link--accent">
        <span aria-hidden className="rail-dot rail-dot--diamond" />
        <span className="rail-label">Head to Head</span>
      </Link>
    </nav>
  );
}
