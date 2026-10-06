import Link from "next/link";
import type { Route } from "next";
import type { DriverStanding, Race } from "@/lib/types";
import type { JolpicaRaceResult } from "@/lib/jolpica";
import { abbreviateName, countryCode, formatRaceDate, inkOf, teamColor, teamShort } from "@/lib/format";
import { CardHead } from "./DriversTable";
import DriverName from "./DriverName";

/** Last completed race and its podium. */
export function LastRaceCard({ race, podium }: { race: Race | null; podium: JolpicaRaceResult[] }) {
  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <CardHead
        title="Last race"
        action={race ? { href: `/races/${race.round}`, label: "Results" } : undefined}
      />
      {!race ? (
        <p className="px-5 py-6 text-sm text-muted">No completed rounds yet — check back after the season opener.</p>
      ) : (
        <div className="px-4 sm:px-5 py-4 flex flex-col gap-4">
          <div>
            <div className="font-display text-[18px] font-semibold leading-tight">{race.race_name}</div>
            <div className="text-[13px] text-muted mt-1">
              Round {race.round} · {formatRaceDate(race.race_date)} · {race.circuit}
            </div>
          </div>
          {podium.length > 0 ? (
            <ol className="flex flex-col gap-1.5">
              {podium.map((r, i) => (
                <li
                  key={r.Driver.driverId}
                  className="grid grid-cols-[28px_4px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-paper-deeper/60 px-2.5 py-2"
                >
                  <span className={`pos-badge ${i === 0 ? "pos-badge--lead" : ""}`}>{r.position}</span>
                  <span aria-hidden className="team-pip !h-5" style={{ background: teamColor(r.Constructor.name) }} />
                  <span className="min-w-0 truncate text-[14.5px]">
                    <DriverName name={`${r.Driver.givenName} ${r.Driver.familyName}`} />
                    <span className="text-muted"> · {teamShort(r.Constructor.name)}</span>
                  </span>
                  <span className="font-mono tabular text-[12px] text-muted">{i === 0 ? "Winner" : r.Time?.time ?? r.status}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">Results will appear once they&apos;re published.</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Championship leader vs runner-up, linking into the comparison page. */
export function TitleFightCard({ drivers }: { drivers: DriverStanding[] }) {
  const [a, b] = drivers;
  if (!a || !b) return null;
  const colorA = teamColor(a.team);
  const colorB = teamColor(b.team);
  const total = a.points + b.points;
  const aPct = total > 0 ? (a.points / total) * 100 : 50;

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <CardHead
        title="Title fight"
        action={{ href: `/compare?a=${a.driver_code}&b=${b.driver_code}`, label: "Compare" }}
      />
      <div className="px-4 sm:px-5 py-5 flex flex-col gap-5 flex-1">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <FightSide d={a} color={colorA} />
          <span className="text-[13px] text-muted-soft pb-2">vs</span>
          <FightSide d={b} color={colorB} right />
        </div>
        <div>
          <div className="flex h-[8px] w-full overflow-hidden rounded-full gap-[2px]">
            <div style={{ width: `${aPct}%`, background: colorA }} />
            <div style={{ width: `${100 - aPct}%`, background: colorB }} />
          </div>
          <p className="mt-3 text-[13px] text-muted">
            {abbreviateName(a.driver_name)} leads by{" "}
            <span className="text-ink font-medium">{a.points - b.points} points</span>
            {" "}with {a.wins} win{a.wins === 1 ? "" : "s"} to {b.wins}.
          </p>
        </div>
      </div>
    </div>
  );
}

function FightSide({ d, color, right }: { d: DriverStanding; color: string; right?: boolean }) {
  return (
    <Link href={`/drivers/${d.driver_code.toLowerCase()}` as Route} className={`min-w-0 group ${right ? "text-right" : ""}`}>
      <span className="font-mono text-[12px] font-bold tracking-[0.06em]" style={{ color: inkOf(color) }}>
        P{d.position} · {d.driver_code}
      </span>
      <div className="text-[15px] font-medium truncate group-hover:text-f1 transition-colors">{abbreviateName(d.driver_name)}</div>
      <div className="font-mono tabular text-[26px] font-semibold leading-none mt-1.5">{d.points}</div>
    </Link>
  );
}

/** The next few rounds as small cards. */
export function UpcomingRaces({ races }: { races: Race[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {races.map((r) => (
        <Link key={r.round} href={`/races/${r.round}` as Route} className="card p-4 sm:p-5 flex flex-col gap-3 min-h-[150px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12px] text-muted">R{String(r.round).padStart(2, "0")} · {countryCode(r.country)}</span>
            {r.is_next ? (
              <span className="chip chip-red !h-6 !text-[11px]">Next</span>
            ) : r.has_sprint ? (
              <span className="chip !h-6 !text-[11px]">Sprint</span>
            ) : null}
          </div>
          <div className="mt-auto">
            <div className="font-display text-[17px] font-semibold leading-tight">{r.country}</div>
            <div className="text-[13px] text-muted mt-0.5 truncate">{r.circuit}</div>
            <div className="font-mono text-[12.5px] text-ink-soft mt-2">{formatRaceDate(r.race_date)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
