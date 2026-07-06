"use client";

import { useSyncExternalStore } from "react";
import { timeGreeting } from "@/lib/format";

const noopSubscribe = () => () => {};
/* False on the server + first paint, true once hydrated. */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/**
 * Time-of-day greeting, computed on the client so it follows the visitor's
 * clock. Rendering it on the server baked the build machine's hour into the
 * ISR-cached page — "Good Morning" all evening for half the planet.
 */
export default function Greeting() {
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <span className="eyebrow hidden md:inline">
      {timeGreeting().toUpperCase()}
    </span>
  );
}
