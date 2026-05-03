"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export interface PaletteItem {
  /** Display title */
  title: string;
  /** Subtitle / context */
  subtitle?: string;
  /** Searchable text (already lowercased recommendations are fine — we lower again) */
  haystack: string;
  /** Route to navigate to */
  href: string;
  /** Group label */
  group: "Drivers" | "Constructors" | "Races" | "Sections";
}

interface Props {
  items: PaletteItem[];
}

const SECTIONS: PaletteItem[] = [
  { title: "Up Next", subtitle: "Next race · countdown", haystack: "next race up next hero", href: "/#next", group: "Sections" },
  { title: "Calendar", subtitle: "Full season schedule", haystack: "calendar season schedule rounds", href: "/#calendar", group: "Sections" },
  { title: "Drivers' Championship", subtitle: "Standings", haystack: "drivers championship standings", href: "/#drivers", group: "Sections" },
  { title: "Constructors' Cup", subtitle: "Standings", haystack: "constructors cup standings teams", href: "/#constructors", group: "Sections" },
  { title: "Last Race", subtitle: "Most recent completed", haystack: "last race paddock recap", href: "/#paddock", group: "Sections" },
  { title: "Forecast", subtitle: "Predictions for next round", haystack: "forecast predictions model", href: "/#forecast", group: "Sections" },
];

export default function CommandPalette({ items }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => [...SECTIONS, ...items], [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((i) => i.haystack.toLowerCase().includes(q));
  }, [allItems, query]);

  const grouped = useMemo(() => {
    const order: PaletteItem["group"][] = [
      "Sections",
      "Drivers",
      "Constructors",
      "Races",
    ];
    const map = new Map<PaletteItem["group"], PaletteItem[]>();
    for (const g of order) map.set(g, []);
    for (const item of filtered) {
      map.get(item.group)?.push(item);
    }
    return order
      .map((g) => ({ group: g, items: map.get(g) ?? [] }))
      .filter((s) => s.items.length > 0);
  }, [filtered]);

  // Flat list with original index for keyboard navigation
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global ⌘K / Ctrl-K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !open) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("lightsout:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("lightsout:open-palette", onOpen);
    };
  }, [open]);

  // Focus input when open; restore body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // wait a frame so the modal is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset active when filter changes
  useEffect(() => {
    setActive(0);
  }, [query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, flat.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[active];
      if (item) {
        close();
        router.push(item.href as Route);
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
    >
      {/* backdrop */}
      <button
        aria-label="Close palette"
        onClick={close}
        className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
      />
      {/* panel */}
      <div className="relative w-full max-w-[640px] bg-paper border border-rule shadow-2xl">
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
            Search
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Drivers, constructors, rounds, sections…"
            className="flex-1 bg-transparent outline-none text-[16px] font-display placeholder:text-muted/70"
          />
          <kbd className="font-mono text-[10px] tracking-[0.16em] text-muted px-1.5 py-0.5 border border-rule">
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {grouped.length === 0 && (
            <div className="px-4 py-8 text-center text-muted text-sm">
              No matches.
            </div>
          )}
          {grouped.map(({ group, items: gItems }) => (
            <div key={group}>
              <div className="sticky top-0 bg-paper-deep px-4 py-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-muted border-b border-rule">
                {group}
              </div>
              <ul>
                {gItems.map((item) => {
                  runningIdx += 1;
                  const idx = runningIdx;
                  const isActive = idx === active;
                  return (
                    <li key={`${item.group}:${item.href}:${idx}`}>
                      <button
                        data-idx={idx}
                        onClick={() => {
                          close();
                          router.push(item.href as Route);
                        }}
                        onMouseEnter={() => setActive(idx)}
                        className={`w-full text-left px-4 py-3 flex items-baseline justify-between gap-4 border-b border-rule/60 ${
                          isActive ? "bg-paper-deep" : "bg-paper"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-display text-[16px] truncate">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="eyebrow mt-0.5 truncate">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        <span
                          className={`font-mono text-[10px] tracking-[0.18em] uppercase shrink-0 ${
                            isActive ? "text-f1" : "text-muted"
                          }`}
                        >
                          {isActive ? "↵ Open" : item.href}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-rule font-mono text-[10px] tracking-[0.16em] uppercase text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </div>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
