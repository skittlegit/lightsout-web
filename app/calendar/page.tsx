import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/app/components/SectionTitle";
import IcsButton from "@/app/components/IcsButton";
import DriverName from "@/app/components/DriverName";
import LocalStartTime from "@/app/components/LocalStartTime";
import { getCalendar, pickNextRace } from "@/lib/api";
import { getSeasonResults } from "@/lib/jolpica";
import { podiumsByRound } from "@/lib/season";
import { countdownLabel, countryCode, daysUntil, raceStartISO, teamColor } from "@/lib/format";
import type { Race } from "@/lib/types";
import type { JolpicaRaceResult } from "@/lib/jolpica";

export const revalidate = 600;
export const metadata = {
  title: "Calendar",
  description: "Every round of the Formula 1 season with dates, start times and winners.",
};

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const DAY = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });
const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

export default async function CalendarPage() {
  const [cal, results] = await Promise.all([getCalendar(), getSeasonResults()]);
  const podiums = podiumsByRound(results ?? []);
  const next = pickNextRace(cal.races);
  const done = cal.races.filter((r) => r.is_completed).length;

  // Group rounds by race month, preserving order.
  const months: { label: string; races: Race[] }[] = [];
  for (const race of cal.races) {
    const label = MONTH.format(new Date(`${race.race_date}T00:00:00Z`));
    const last = months.at(-1);
    if (last?.label === label) last.races.push(race);
    else months.push({ label, races: [race] });
  }

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker={`${cal.season} season`}
        title="Race calendar"
        description={
          <>
            {cal.races.length} rounds · {done} complete
            {next && (
              <>
                {" "}· next up{" "}
                <Link href={`/races/${next.round}` as Route} className="text-ink hover:text-f1 transition-colors">
                  {next.race_name}
                </Link>
              </>
            )}
          </>
        }
        aside={
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-[13px] text-muted mb-2">
              <span>Season progress</span>
              <span className="font-mono">{Math.round((done / Math.max(1, cal.races.length)) * 100)}%</span>
            </div>
            <div className="h-[6px] rounded-full bg-paper-deeper overflow-hidden">
              <div className="h-full rounded-full bg-f1" style={{ width: `${(done / Math.max(1, cal.races.length)) * 100}%` }} />
            </div>
          </div>
        }
      />

      <div className="container-max flex flex-col gap-8">
        {months.map((m) => (
          <section key={m.label} aria-labelledby={`month-${m.label}`}>
            <h2 id={`month-${m.label}`} className="text-[13px] font-medium text-muted mb-3">{m.label}</h2>
            <ol className="card overflow-hidden">
              {m.races.map((race) => (
                <RaceRow key={race.round} race={race} podium={podiums.get(race.round) ?? []} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}

function RaceRow({ race, podium }: { race: Race; podium: JolpicaRaceResult[] }) {
  const date = new Date(`${race.race_date}T00:00:00Z`);
  const winner = podium[0];
  const days = race.is_next ? daysUntil(race.race_date) : null;

  return (
    <li className={`flex items-center border-b border-rule last:border-b-0 ${race.is_next ? "bg-f1/[0.06]" : ""}`}>
      <Link
        href={`/races/${race.round}` as Route}
        className="row-hover flex-1 min-w-0 grid grid-cols-[3rem_minmax(0,1fr)] sm:grid-cols-[3.25rem_minmax(0,1fr)_minmax(0,15rem)] items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-3.5"
      >
        <div className="text-center leading-none">
          <div className="font-display text-[22px] font-bold">{DAY.format(date)}</div>
          <div className="text-[11.5px] text-muted mt-1">{WEEKDAY.format(date)}</div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[12px] text-muted shrink-0">R{String(race.round).padStart(2, "0")}</span>
            <span className={`truncate text-[15px] font-medium ${race.is_completed ? "text-ink-soft" : ""}`}>{race.race_name}</span>
            {race.has_sprint && <span className="chip !h-5 !px-2 !text-[10.5px] shrink-0">Sprint</span>}
          </div>
          <div className="text-[13px] text-muted truncate mt-0.5">
            {race.circuit} · {countryCode(race.country)}
          </div>
        </div>

        <div className="col-start-2 sm:col-start-auto text-[13px] sm:text-right min-w-0">
          {race.is_completed ? (
            winner ? (
              <span className="inline-flex items-center gap-2 min-w-0">
                <span aria-hidden className="team-pip !h-4" style={{ background: teamColor(winner.Constructor.name) }} />
                <span className="truncate">
                  <span className="text-muted">Won by </span>
                  <DriverName name={`${winner.Driver.givenName} ${winner.Driver.familyName}`} />
                </span>
              </span>
            ) : (
              <span className="text-muted">Results pending</span>
            )
          ) : race.is_next ? (
            <span className="text-f1-soft font-medium">
              Next · {days !== null ? countdownLabel(days) : ""}
            </span>
          ) : race.race_time ? (
            <span className="text-muted">
              <LocalStartTime iso={raceStartISO(race.race_date, race.race_time)} />
            </span>
          ) : null}
        </div>
      </Link>
      {!race.is_completed && (
        <div className="pr-3 sm:pr-4">
          <IcsButton race={race} />
        </div>
      )}
    </li>
  );
}
