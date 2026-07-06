"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
/* SSR-safe Apple-platform sniff: false on the server + first paint, real
   value once hydrated — no effect, no cascading render. */
function useIsMac(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => /mac|iphone|ipad|ipod/i.test(navigator.userAgent),
    () => false
  );
}

export default function PaletteTrigger() {
  const isMac = useIsMac();

  function open() {
    window.dispatchEvent(new Event("lightsout:open-palette"));
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open search"
      className="inline-flex items-center gap-2 px-2 py-1 border border-rule hover:border-ink transition-colors focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
    >
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
        Search
      </span>
      <kbd className="font-mono text-[10px] tracking-[0.16em] text-ink/80">
        {isMac ? "⌘" : "Ctrl"}K
      </kbd>
    </button>
  );
}
