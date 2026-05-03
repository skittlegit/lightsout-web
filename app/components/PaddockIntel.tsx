import type { DriverStanding, Race } from "@/lib/types";
import { abbreviateName, formatRaceDate, teamColor, teamShort } from "@/lib/format";
import { SectionHead } from "./DriversTable";
import Link from "next/link";

interface Props {
  lastRace: Race | null;
  drivers: DriverStanding[];
}

/**
 * Last Race Recap — honest, real-data-only column.
 * Shows the last completed race header + the top-3 championship snapshot
 * (since the backend doesn't expose per-round podium results yet).
 */
export default function PaddockIntelView({ lastRace, drivers }: Props) {
  const top3 = drivers.slice(0, 3);

  return (
    <div className="flex flex-col">
      <SectionHead num="03" headHTML="Last" tail="Race" />

      {!lastRace ? (
        <p className="mt-6 text-sm text-muted">
          No completed rounds yet — check back after the season opener.
        </p>
      ) : (
        <>
          <Link
            href={`/races/${lastRace.round}`}
            className="mt-6 block border border-rule p-4 hover:border-ink transition-colors focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
          >
            <span className="eyebrow-red block">
              Round {String(lastRace.round).padStart(2, "0")} · Completed
            </span>
            <div className="mt-2 font-display text-[22px] leading-tight">
              {lastRace.race_name}
            </div>
            <div className="eyebrow mt-1.5">
              {lastRace.circuit} · {formatRaceDate(lastRace.race_date)}
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-f1">
              View race detail →
            </div>
          </Link>

          <span className="eyebrow mt-7 block">Championship · Top 3</span>
          <ul className="mt-3 flex flex-col">
            {top3.map((d) => {
              const color = teamColor(d.team);
              return (
                <li
                  key={d.driver_code}
                  className="relative grid grid-cols-[1.25rem_1fr_auto] gap-3 items-center py-2.5 border-b border-rule last:border-b-0"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-[3px]"
                    style={{ background: color }}
                  />
                  <span className="font-mono tabular text-[12px] text-muted pl-2">
                    P{d.position}
                  </span>
                  <Link
                    href={`/drivers/${d.driver_code.toLowerCase()}`}
                    className="min-w-0 hover:text-f1 transition-colors focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
                  >
                    <div className="font-display text-[17px] leading-tight truncate">
                      {abbreviateName(d.driver_name)}
                    </div>
                    <div className="eyebrow mt-0.5 truncate">
                      {teamShort(d.team)} · {d.driver_code}
                    </div>
                  </Link>
                  <span className="font-mono tabular text-[12px] text-ink">
                    {d.points} <span className="eyebrow">PTS</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 text-xs text-muted leading-relaxed">
            Per-round podium results will appear here once the backend exposes
            race results. Until then, the championship snapshot stands in.
          </p>
        </>
      )}
    </div>
  );
}
