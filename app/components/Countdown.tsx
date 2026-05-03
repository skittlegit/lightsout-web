"use client";

import { useEffect, useState } from "react";
import { pad2 } from "@/lib/format";

interface Props {
  /** ISO datetime string of the lights-out moment. */
  targetISO: string;
}

interface Parts {
  d: number;
  h: number;
  m: number;
  s: number;
  past: boolean;
}

function diff(target: number): Parts {
  const now = Date.now();
  let delta = Math.floor((target - now) / 1000);
  const past = delta < 0;
  if (past) delta = 0;
  const d = Math.floor(delta / 86400);
  const h = Math.floor((delta % 86400) / 3600);
  const m = Math.floor((delta % 3600) / 60);
  const s = delta % 60;
  return { d, h, m, s, past };
}

export default function Countdown({ targetISO }: Props) {
  const target = new Date(targetISO).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(diff(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  // SSR + first paint: render fixed scaffolding (zeros) to avoid hydration shift
  const p = parts ?? { d: 0, h: 0, m: 0, s: 0, past: false };

  return (
    <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
      <span className="eyebrow text-paper/60">Lights Out In</span>
      <div className="flex items-baseline" aria-live="polite" aria-atomic="true">
        <Cell value={p.d} />
        <Colon />
        <Cell value={p.h} />
        <Colon />
        <Cell value={p.m} />
        <Colon />
        <Cell value={p.s} />
      </div>
      <div
        aria-hidden
        className="grid grid-cols-4 gap-3 w-full max-w-[340px] lg:max-w-none lg:w-full"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        <Label>Days</Label>
        <Label>Hrs</Label>
        <Label>Min</Label>
        <Label>Sec</Label>
      </div>
      {p.past && (
        <span className="eyebrow-red mt-1">Race in progress</span>
      )}
    </div>
  );
}

function Cell({ value }: { value: number }) {
  return (
    <span className="tabular font-mono text-[clamp(2.5rem,9vw,3.75rem)] leading-none text-paper">
      {pad2(value)}
    </span>
  );
}

function Colon() {
  return (
    <span
      aria-hidden
      className="tabular font-mono text-[clamp(2.5rem,9vw,3.75rem)] leading-none text-paper colon-pulse mx-1"
    >
      :
    </span>
  );
}

function Label({ children }: { children: string }) {
  return (
    <span className="eyebrow text-paper/55 text-center">{children}</span>
  );
}
