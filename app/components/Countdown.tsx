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
  const [parts, setParts] = useState<Parts>(() => diff(target));

  useEffect(() => {
    const tick = () => setParts(diff(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const cell = (n: number) => (
    <span className="tabular font-mono text-[44px] md:text-[56px] leading-none text-paper">
      {pad2(n)}
    </span>
  );
  const colon = (
    <span className="tabular font-mono text-[44px] md:text-[56px] leading-none text-paper colon-pulse mx-1">
      :
    </span>
  );

  return (
    <div className="flex flex-col items-end gap-3">
      <span className="eyebrow text-paper/60">Lights Out In</span>
      <div className="flex items-baseline">
        {cell(parts.d)}
        {colon}
        {cell(parts.h)}
        {colon}
        {cell(parts.m)}
        {colon}
        {cell(parts.s)}
      </div>
      <div className="grid grid-cols-4 gap-3 w-full text-right">
        <span className="eyebrow text-paper/50 text-center">DAYS</span>
        <span className="eyebrow text-paper/50 text-center">HRS</span>
        <span className="eyebrow text-paper/50 text-center">MIN</span>
        <span className="eyebrow text-paper/50 text-center">SEC</span>
      </div>
      {parts.past && (
        <span className="eyebrow-red mt-1">RACE IN PROGRESS</span>
      )}
    </div>
  );
}
