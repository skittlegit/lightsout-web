import Link from "next/link";
import { notFound } from "next/navigation";
import BackBar from "@/app/components/BackBar";
import Footer from "@/app/components/Footer";
import CircuitVisual from "@/app/components/CircuitVisual";
import Forecast from "@/app/components/Forecast";
import { getCalendar, getPrediction } from "@/lib/api";
import { getCircuit, getRaceResults, getQualifying } from "@/lib/jolpica";
import {
  countryCode,
  formatRaceFullDate,
  splitRaceName,
  teamColor,
  teamShort,
} from "@/lib/format";
import { teamSlug } from "@/lib/slug";
import type { JolpicaRaceResult, JolpicaQualifyingResult } from "@/lib/jolpica";

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
  return { title: `Round ${round} · Race · LightsOut` };
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

  const { head, tail } = splitRaceName(race.race_name);
  const status = race.is_completed
    ? "Completed"
    : race.is_next
      ? "Up Next"
      : "Scheduled";
  const statusColor = race.is_completed
    ? "text-muted"
    : race.is_next
      ? "text-f1"
      : "text-ink";

  return (
    <main className="flex-1 w-full">
      <BackBar
        crumb="Calendar"
        crumbHref="/#calendar"
        label={`Round ${String(roundN).padStart(2, "0")}`}
      />

      <section className="section-y">
        <div className="container-max">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className={`eyebrow-red ${statusColor}`}>
              Round {String(roundN).padStart(2, "0")} · {status}
            </span>
            <span className="chip">{countryCode(race.country)}</span>
          </div>

          <h1 className="headline h-detail mt-6">
            {head}
            {tail && (
              <>
                {" "}
                <em>{tail}</em>
              </>
            )}
          </h1>

          <div className="mt-8 stat-strip grid-cols-2 md:grid-cols-4">
            <Stat label="Country" value={race.country} />
            <Stat label="Circuit" value={race.circuit} />
            <Stat label="Race Day" value={formatRaceFullDate(race.race_date)} mono />
            <Stat
              label="Round"
              value={`${String(roundN).padStart(2, "0")} of ${String(cal.races.length).padStart(2, "0")}`}
              mono
            />
          </div>
        </div>
      </section>

      {/* Circuit visual */}
      {circuit && (
        <section className="py-6">
          <div className="container-max grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-stretch">
            <CircuitVisual circuit={circuit} variant="wide" />
            <div className="flex flex-col justify-end">
              <span className="eyebrow-red block">Layout</span>
              <h3 className="headline h-subsection mt-2">
                Track <em>Card</em>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted max-w-md">
                Geographic and reference data for {circuit.circuitName}.
                Track outline is stylised — see Wikipedia link for the
                survey-accurate layout.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* If completed: results + quali. If upcoming: prediction. */}
      {race.is_completed ? (
        <>
          <ResultsBlock results={results?.Results ?? []} />
          <QualifyingBlock results={quali?.QualifyingResults ?? []} />
        </>
      ) : prediction ? (
        <Forecast data={prediction} />
      ) : (
        <section className="py-10">
          <div className="container-max">
            <div className="card card-deep p-7 md:p-10">
              <span className="eyebrow-red block">Forecast</span>
              <p className="mt-3 font-display italic text-[clamp(1.15rem,2.5vw,1.5rem)] text-ink-soft max-w-xl">
                Prediction not yet generated for this round.
              </p>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

/* --------------------------- Results --------------------------- */

function ResultsBlock({ results }: { results: JolpicaRaceResult[] }) {
  if (!results.length) return null;
  return (
    <section className="px-6 md:px-10 py-10 md:py-14">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h2 className="headline text-[10vw] md:text-[3rem]">
            Race <em>Results</em>
          </h2>
          <span className="eyebrow">FINAL CLASSIFICATION</span>
        </div>
        <div className="rule-thin mt-4" />

        <div className="mt-8 overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="text-left">
                <Th>Pos</Th>
                <Th>Driver</Th>
                <Th>Team</Th>
                <Th>Grid</Th>
                <Th>Laps</Th>
                <Th>Time / Status</Th>
                <Th>Pts</Th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const code = r.Driver.code ?? "";
                const team = r.Constructor.name;
                const color = teamColor(team);
                return (
                  <tr key={r.Driver.driverId} className="border-t border-rule">
                    <Td mono>
                      <span
                        className="inline-block w-[3px] h-[14px] mr-2 align-middle"
                        style={{ background: color }}
                      />
                      {r.position}
                    </Td>
                    <Td>
                      <Link
                        href={code ? `/drivers/${code.toLowerCase()}` : "#"}
                        className="hover:text-f1 transition-colors"
                      >
                        <span className="font-display italic">
                          {r.Driver.givenName} {r.Driver.familyName}
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/constructors/${teamSlug(team)}`}
                        className="hover:text-f1 transition-colors"
                      >
                        {teamShort(team)}
                      </Link>
                    </Td>
                    <Td mono>{r.grid}</Td>
                    <Td mono>{r.laps}</Td>
                    <Td mono>
                      {r.Time?.time ?? r.status}
                      {r.FastestLap?.rank === "1" && (
                        <span className="ml-2 inline-block px-1.5 border border-f1 text-f1 text-[9px] tracking-[0.16em]">
                          FL
                        </span>
                      )}
                    </Td>
                    <Td mono>{r.points}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Qualifying --------------------------- */

function QualifyingBlock({ results }: { results: JolpicaQualifyingResult[] }) {
  if (!results.length) return null;
  return (
    <section className="px-6 md:px-10 py-10 pb-16 md:pb-24">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h2 className="headline text-[10vw] md:text-[3rem]">
            Qualifying <em>Splits</em>
          </h2>
          <span className="eyebrow">Q1 · Q2 · Q3</span>
        </div>
        <div className="rule-thin mt-4" />

        <div className="mt-8 overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse min-w-[680px]">
            <thead>
              <tr className="text-left">
                <Th>Pos</Th>
                <Th>Driver</Th>
                <Th>Team</Th>
                <Th>Q1</Th>
                <Th>Q2</Th>
                <Th>Q3</Th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const code = r.Driver.code ?? "";
                const color = teamColor(r.Constructor.name);
                return (
                  <tr key={r.Driver.driverId} className="border-t border-rule">
                    <Td mono>
                      <span
                        className="inline-block w-[3px] h-[14px] mr-2 align-middle"
                        style={{ background: color }}
                      />
                      {r.position}
                    </Td>
                    <Td>
                      <Link
                        href={code ? `/drivers/${code.toLowerCase()}` : "#"}
                        className="hover:text-f1 transition-colors"
                      >
                        <span className="font-display italic">
                          {r.Driver.givenName} {r.Driver.familyName}
                        </span>
                      </Link>
                    </Td>
                    <Td>{teamShort(r.Constructor.name)}</Td>
                    <Td mono>{r.Q1 ?? "—"}</Td>
                    <Td mono>{r.Q2 ?? "—"}</Td>
                    <Td mono>{r.Q3 ?? "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="eyebrow">{label}</span>
      <span
        className={`text-[15px] md:text-[17px] leading-snug ${
          mono ? "font-mono tabular" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted py-2 pr-4 font-medium">
      {children}
    </th>
  );
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`py-3 pr-4 text-sm ${mono ? "font-mono tabular" : ""}`}>
      {children}
    </td>
  );
}
