"use client";

import type { Race } from "@/lib/types";
import { downloadRaceIcs } from "@/lib/ics";

/** Downloads a race as an .ics calendar event. */
export default function IcsButton({ race, label }: { race: Race; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => downloadRaceIcs(race)}
      title="Add to calendar (.ics)"
      aria-label={`Add ${race.race_name} to your calendar`}
      className={label ? "btn btn-ghost" : "grid place-items-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-paper-deeper transition-colors"}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 6.5 H13.5 M5 2 V4.5 M11 2 V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8 8.4 V11.6 M6.4 10 H9.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  );
}
