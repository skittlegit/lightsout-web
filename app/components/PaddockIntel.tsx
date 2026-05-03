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
            className="mt-6 block card hover-lift p-5 group"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow-red">
                Round {String(lastRace.round).padStart(2, "0")} · Completed
              </span>
              <span className="eyebrow">
                {formatRaceDate(lastRace.race_date)}
              </span>
            </div>
            <div className="mt-3 font-display italic text-[clamp(1.25rem,2.5vw,1.6rem)] leading-tight group-hover:text-f1 transition-colors">
              {lastRace.race_name}
            </div>
            <div className="eyebrow mt-1.5">{lastRace.circuit}</div>
            <div className="mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-f1 inline-flex items-center gap-1.5">
              View race detail <span aria-hidden>→</span>
            </div>
          </Link>

          <span className="eyebrow mt-7 block">Championship · Top 3</span>
          <ul className="mt-3 flex flex-col">
            {top3.map((d) => {
              const color = teamColor(d.team);
              return (
                <li
                  key={d.driver_code}
                  className="row-hover relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-3 items-center py-2.5 border-b border-rule last:border-b-0 group"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-[3px]"
                    style={{ background: color }}
                  />
                  <span className="font-mono tabular text-[12px] text-muted pl-3">
                    P{d.position}
                  </span>
                  <Link
                    href={`/drivers/${d.driver_code.toLowerCase()}`}
                    className="min-w-0"
                  >
                    <div className="font-display text-[17px] leading-tight truncate group-hover:text-f1 transition-colors">
                      {abbreviateName(d.driver_name)}
                    </div>
                    <div className="eyebrow mt-0.5 truncate">
                      {teamShort(d.team)} · {d.driver_code}
                    </div>
                  </Link>
                  <span className="font-mono tabular text-[12px] text-ink shrink-0">
                    {d.points}
                    <span className="eyebrow ml-1">PTS</span>
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
