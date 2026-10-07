"use client";

import { useSyncExternalStore } from "react";

interface Props {
  /** UTC instant, e.g. "2026-10-11T12:00:00Z". */
  iso: string;
  className?: string;
}

const noopSubscribe = () => () => {};

/**
 * Race start in the viewer's own timezone. The server (and ISR cache) can't
 * know that zone, so server render + first paint show UTC, then local time.
 */
export default function LocalStartTime({ iso, className }: Props) {
  const label = useSyncExternalStore(
    noopSubscribe,
    () => format(iso),
    () => format(iso, "UTC"),
  );
  return (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  );
}

function format(iso: string, timeZone?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(d);
}
