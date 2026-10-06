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

/** Large countdown digits for dark surfaces; seconds tick in red. */
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

  // role="timer" is not a live region, so screen readers announce this only on
  // focus — never once per second. Seconds are left out of the label on purpose.
  const srLabel = p.past
    ? "Race in progress"
    : `${p.d} days ${p.h} hours ${p.m} minutes until lights out`;

  if (p.past) {
    return (
      <div role="timer" aria-label={srLabel} className="flex items-center gap-3">
        <span className="pulse-dot inline-block w-[10px] h-[10px] rounded-full bg-f1" />
        <span className="font-display text-2xl font-extrabold">Race in progress</span>
      </div>
    );
  }

  return (
    <div role="timer" aria-label={srLabel} className="flex items-start gap-5 sm:gap-8">
      <Segment value={p.d} label="Days" />
      <Segment value={p.h} label="Hrs" />
      <Segment value={p.m} label="Mins" />
      <Segment value={p.s} label="Secs" live />
    </div>
  );
}

function Segment({ value, label, live }: { value: number; label: string; live?: boolean }) {
  return (
    <div aria-hidden className="flex flex-col">
      <span className={`font-display font-extrabold tabular leading-none text-[clamp(2.4rem,6vw,4rem)] ${live ? "text-f1-soft" : "text-white"}`}>
        {pad2(value)}
      </span>
      <span className="mt-2 text-[12px] font-bold uppercase tracking-[0.08em] text-white/60">{label}</span>
    </div>
  );
}
