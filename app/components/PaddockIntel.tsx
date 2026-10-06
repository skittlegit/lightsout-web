import type { DriverStanding, Race } from "@/lib/types";
import type { JolpicaRaceResult } from "@/lib/jolpica";
import { abbreviateName, formatRaceDate, teamColor, teamShort } from "@/lib/format";
import { SectionHead } from "./DriversTable";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  lastRace: Race | null;
  drivers: DriverStanding[];
  /** Last race's top three finishers (empty if results aren't published yet). */
  podium: JolpicaRaceResult[];
}

/**
 * Last Race Recap — honest, real-data-only column.
 */
export default function PaddockIntelView({ lastRace, drivers, podium }: Props) {
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
            {podium.length > 0 && <PodiumList podium={podium} />}
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

          {drivers.length >= 2 && (
            <TitleFight a={drivers[0]} b={drivers[1]} />
          )}
        </>
      )}
    </div>
  );
}

/** Final top three, P1 emphasised, gaps from the official classification. */
function PodiumList({ podium }: { podium: JolpicaRaceResult[] }) {
  return (
    <ol className="mt-4 flex flex-col border-t border-rule">
      {podium.map((r, i) => (
        <li key={r.Driver.driverId} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-2 py-2 border-b border-rule">
          <span className={`font-mono tabular text-[11px] ${i === 0 ? "text-f1" : "text-muted"}`}>P{r.position}</span>
          <span className="min-w-0 truncate">
            <span aria-hidden className="inline-block w-[6px] h-[6px] rounded-full mr-2 align-middle" style={{ background: teamColor(r.Constructor.name) }} />
            <span className={`font-display ${i === 0 ? "text-[17px]" : "text-[15px]"}`}>{r.Driver.familyName}</span>
            <span className="eyebrow ml-2">{teamShort(r.Constructor.name)}</span>
          </span>
          <span className="font-mono tabular text-[11px] text-muted">{i === 0 ? "WIN" : r.Time?.time ?? r.status}</span>
        </li>
      ))}
    </ol>
  );
}

/** Compact P1-vs-P2 head-to-head, linking into the full comparison page. */
function TitleFight({ a, b }: { a: DriverStanding; b: DriverStanding }) {
  const colorA = teamColor(a.team);
  const colorB = teamColor(b.team);
  const total = a.points + b.points;
  const aPct = total > 0 ? (a.points / total) * 100 : 50;

  return (
    <>
      <span className="eyebrow mt-7 block">Head to Head · Title Fight</span>
      <Link
        href={`/compare?a=${a.driver_code}&b=${b.driver_code}` as Route}
        className="mt-3 block card hover-lift p-4 group"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <FightSide d={a} color={colorA} align="left" />
          <span className="font-mono text-[10px] tracking-[0.16em] text-muted-soft uppercase pb-1">
            vs
          </span>
          <FightSide d={b} color={colorB} align="right" />
        </div>
        <div className="mt-3 flex h-[4px] w-full overflow-hidden bg-paper-deep">
          <div style={{ width: `${aPct}%`, background: colorA }} />
          <div style={{ width: `${100 - aPct}%`, background: colorB }} />
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-[0.2em] uppercase text-f1 inline-flex items-center gap-1.5">
          Full comparison <span aria-hidden>⤳</span>
        </div>
      </Link>
    </>
  );
}

function FightSide({
  d,
  color,
  align,
}: {
  d: DriverStanding;
  color: string;
  align: "left" | "right";
}) {
  const right = align === "right";
  return (
    <div className={`min-w-0 ${right ? "text-right" : ""}`}>
      <span
        className="font-mono tabular text-[11px] tracking-[0.16em]"
        style={{ color }}
      >
        {d.driver_code}
      </span>
      <div className="font-display text-[16px] leading-tight truncate group-hover:text-f1 transition-colors">
        {abbreviateName(d.driver_name)}
      </div>
      <div className="font-mono tabular text-[13px]">
        {d.points}
        <span className="eyebrow ml-1">PTS</span>
      </div>
    </div>
  );
}
