"use client";

import { useEffect, useState } from "react";

export default function PaletteTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.platform));
  }, []);

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
