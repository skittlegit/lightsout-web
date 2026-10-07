import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import BackBar from "@/app/components/BackBar";
import { TrackOutline, circuitMeta } from "@/app/components/Circuit";
import DriverName from "@/app/components/DriverName";
import Forecast from "@/app/components/Forecast";
import IcsButton from "@/app/components/IcsButton";
import LocalStartTime from "@/app/components/LocalStartTime";
import SectionTitle from "@/app/components/SectionTitle";
import { BannerChip, BannerStat, TableCard } from "@/app/components/ui";
import RaceRecapBlock from "@/app/components/RaceRecap";
import { getCalendar, getPrediction } from "@/lib/api";
import { getCircuit, getRaceResults, getQualifying } from "@/lib/jolpica";
import {
  countryCode,
  formatRaceFullDate,
  raceStartISO,
  splitRaceName,
  teamColor,
  teamShort,
} from "@/lib/format";
import { teamSlug } from "@/lib/slug";
import { raceRecap, gridDelta, finishGap, type RaceRecap } from "@/lib/recap";
import type { JolpicaRaceResult, JolpicaQualifyingResult } from "@/lib/jolpica";

// Upcoming rounds render the forecast, which can take several seconds cold.
export const maxDuration = 60;
export const revalidate = 600;

interface Params {
  round: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { round } = await params;
  const roundN = Number(round);
  // getCalendar() is deduped with the page's own call, so this costs nothing.
  const race = Number.isFinite(roundN)
    ? (await getCalendar()).races.find((r) => r.round === roundN)
    : undefined;
  return {
    title: race ? `${race.race_name} · Round ${round}` : `Round ${round} · Race`,
    description: race
      ? `${race.race_name} at ${race.circuit} — results, qualifying, and forecast.`
      : undefined,
  };
}

export default async function RacePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { round } = await params;
  const roundN = Number(round);
  if (!Number.isFinite(roundN) || roundN < 1) notFound();

  const cal = await getCalendar();
  const race = cal.races.find((r) => r.round === roundN);
  if (!race) notFound();

  const [circuit, results, quali, prediction] = await Promise.all([
    getCircuit(roundN),
    race.is_completed ? getRaceResults(roundN) : Promise.resolve(null),
    race.is_completed ? getQualifying(roundN) : Promise.resolve(null),
    race.is_completed ? Promise.resolve(null) : getPrediction(roundN),
  ]);

  const raceResults = results?.Results ?? [];
  const recap = race.is_completed ? raceRecap(raceResults) : null;
  const meta = circuit ? circuitMeta(circuit.circuitId) : null;
  const { head, tail } = splitRaceName(race.race_name);
  const status = race.is_completed ? "Completed" : race.is_next ? "Next race" : "Upcoming";

  return (
    <main className="flex-1 w-full">
      <BackBar crumb="Calendar" crumbHref="/calendar" label={race.race_name} />

      {/* Race banner: title, facts, track map */}
      <section className="pt-6">
        <div className="container-max">
          <div className="panel-carbon overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-8 p-6 sm:p-8 md:p-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`chip ${race.is_next ? "chip-red" : ""}`}>{status}</span>
                  <BannerChip>Round {race.round} of {cal.races.length}</BannerChip>
                  {race.has_sprint && <BannerChip>Sprint weekend</BannerChip>}
                </div>
                <h1 className="headline h-detail mt-6">
                  {head}
                  {tail && <> <em>{tail}</em></>}
                </h1>
                <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <BannerStat label="Circuit" value={<span className="text-[clamp(1rem,1.6vw,1.15rem)]">{race.circuit}</span>} />
                  <BannerStat label="Country" value={<span className="text-[clamp(1rem,1.6vw,1.15rem)]">{race.country} · {countryCode(race.country)}</span>} />
                  <BannerStat
                    label={race.race_time ? "Lights out (your time)" : "Race day"}
                    value={
                      <span className="text-[clamp(1rem,1.6vw,1.15rem)]">
                        {race.race_time ? <LocalStartTime iso={raceStartISO(race.race_date, race.race_time)} /> : formatRaceFullDate(race.race_date)}
                      </span>
                    }
                  />
                </dl>
                {!race.is_completed && (
                  <div className="mt-8">
                    <IcsButton race={race} label="Add to calendar" />
                  </div>
                )}
              </div>

              {circuit && meta && (
                <div className="flex flex-col justify-between gap-6">
                  <TrackOutline circuitId={circuit.circuitId} label={circuit.circuitName} className="w-full h-auto max-w-[460px] mx-auto" />
                  <dl className="grid grid-cols-3 gap-4 border-t border-rule pt-5">
                    <BannerStat label="Length" value={meta.km ? `${meta.km.toFixed(3)} km` : "—"} />
                    <BannerStat label="Corners" value={meta.turns ?? "—"} />
                    <BannerStat label="DRS zones" value={meta.drs ?? "—"} />
                  </dl>
                  {meta.lapRecord && <p className="text-[13px] text-muted -mt-2">Lap record · {meta.lapRecord}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {race.is_completed ? (
        <>
          {recap && <RecapSection results={raceResults} recap={recap} />}
          <ResultsSection results={raceResults} />
          <QualifyingSection results={quali?.QualifyingResults ?? []} />
          {!raceResults.length && (
            <section className="section-y">
              <div className="container-max">
                <div className="card p-7">
                  <p className="text-muted">Results for this round haven&apos;t been published yet.</p>
                </div>
              </div>
            </section>
          )}
        </>
      ) : prediction ? (
        <Forecast data={prediction} />
      ) : (
        <section className="section-y">
          <div className="container-max">
            <div className="card p-7">
              <h2 className="font-display text-xl">Forecast not available yet</h2>
              <p className="mt-2 text-muted">Predictions appear for upcoming rounds once the model has run.</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* --------------------------- Recap --------------------------- */

function RecapSection({ results, recap }: { results: JolpicaRaceResult[]; recap: RaceRecap }) {
  return (
    <section className="section-y">
      <div className="container-max">
        <SectionTitle kicker="Race recap" title="Podium" />
        <div className="mt-6">
          <RaceRecapBlock results={results} recap={recap} />
        </div>
      </div>
    </section>
  );
}

function GridDelta({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) return <span className="text-muted-soft">—</span>;
  const gained = delta > 0;
  return (
    <span className={gained ? "text-timing-green" : "text-f1"}>
      <span aria-hidden>{gained ? "▲" : "▼"}</span> {Math.abs(delta)}
    </span>
  );
}

/* --------------------------- Results --------------------------- */

function DriverCell({ r }: { r: JolpicaRaceResult | JolpicaQualifyingResult }) {
  const code = r.Driver.code ?? "";
  return (
    <Link
      href={(code ? `/drivers/${code.toLowerCase()}` : "/drivers") as Route}
      className="flex items-center gap-3 hover:text-f1 transition-colors"
    >
      <span aria-hidden className="team-pip" style={{ background: teamColor(r.Constructor.name) }} />
      <DriverName name={`${r.Driver.givenName} ${r.Driver.familyName}`} />
    </Link>
  );
}

function ResultsSection({ results }: { results: JolpicaRaceResult[] }) {
  if (!results.length) return null;
  const winnerLaps = Math.max(...results.map((r) => Number(r.laps) || 0));
  return (
    <section className="pb-4">
      <div className="container-max">
        <SectionTitle kicker="Final classification" title="Race results" />
        <div className="mt-6">
          <TableCard minWidth={760}>
            <thead>
              <tr>
                <th className="w-14">Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th className="num">Grid</th>
                <th className="num">+/−</th>
                <th className="num">Laps</th>
                <th>Time / status</th>
                <th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const pos = Number(r.position);
                return (
                  <tr key={r.Driver.driverId}>
                    <td><span className={`pos-badge ${pos === 1 ? "pos-badge--lead" : ""}`}>{r.position}</span></td>
                    <td><DriverCell r={r} /></td>
                    <td>
                      <Link href={`/constructors/${teamSlug(r.Constructor.name)}` as Route} className="text-muted hover:text-f1 transition-colors">
                        {teamShort(r.Constructor.name)}
                      </Link>
                    </td>
                    <td className="num">{r.grid}</td>
                    <td className="num"><GridDelta delta={gridDelta(r)} /></td>
                    <td className="num">{r.laps}</td>
                    <td className="tabular">
                      {finishGap(r, winnerLaps)}
                      {r.FastestLap?.rank === "1" && (
                        <span className="chip !h-5 !px-1.5 !text-[10.5px] ml-2 !bg-timing-purple !text-white" title="Fastest lap">
                          FL
                        </span>
                      )}
                    </td>
                    <td className="num font-semibold">{r.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableCard>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Qualifying --------------------------- */

function QualifyingSection({ results }: { results: JolpicaQualifyingResult[] }) {
  if (!results.length) return null;
  return (
    <section className="section-y">
      <div className="container-max">
        <SectionTitle kicker="Saturday" title="Qualifying" />
        <div className="mt-6">
          <TableCard minWidth={680}>
            <thead>
              <tr>
                <th className="w-14">Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th className="num">Q1</th>
                <th className="num">Q2</th>
                <th className="num">Q3</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.Driver.driverId}>
                  <td><span className={`pos-badge ${r.position === "1" ? "pos-badge--lead" : ""}`}>{r.position}</span></td>
                  <td><DriverCell r={r} /></td>
                  <td className="text-muted">{teamShort(r.Constructor.name)}</td>
                  <td className="num">{r.Q1 ?? "—"}</td>
                  <td className="num">{r.Q2 ?? "—"}</td>
                  <td className="num font-semibold">{r.Q3 ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        </div>
      </div>
    </section>
  );
}
