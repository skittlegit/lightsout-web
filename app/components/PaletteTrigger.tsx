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
      className="inline-flex items-center gap-2.5 h-10 pl-3.5 pr-2 rounded-full bg-black/15 text-white hover:bg-black/25 transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline text-[14px] font-semibold">
        Search
      </span>
      <kbd className="hidden sm:inline font-mono text-[11px] text-white bg-white/20 rounded-md px-1.5 py-0.5">
        {isMac ? "⌘" : "Ctrl"}K
      </kbd>
    </button>
  );
}
