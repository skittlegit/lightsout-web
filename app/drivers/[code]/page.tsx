import Link from "next/link";
import { notFound } from "next/navigation";
import BackBar from "@/app/components/BackBar";
import Footer from "@/app/components/Footer";
import { getDriverStandings, getCalendar } from "@/lib/api";
import { getDrivers, getDriverResults } from "@/lib/jolpica";
import { driverIdFromCode, teamSlug } from "@/lib/slug";
import {
  teamColor,
  teamShort,
  countryCode,
  formatRaceDate,
} from "@/lib/format";
import type { Race } from "@/lib/types";

export const revalidate = 600;

interface Params {
  code: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  return { title: `${code.toUpperCase()} · Driver · LightsOut` };
}

export default async function DriverPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  const [standings, allDrivers, cal] = await Promise.all([
    getDriverStandings(),
    getDrivers(),
    getCalendar(),
  ]);

  const standing = standings.find((d) => d.driver_code === upperCode);
  if (!standing) notFound();

  const jolpicaId = driverIdFromCode(upperCode);
  const profile = jolpicaId
    ? allDrivers.find((d) => d.driverId === jolpicaId)
    : allDrivers.find((d) => d.code?.toUpperCase() === upperCode);

  const seasonResults = jolpicaId ? await getDriverResults(jolpicaId) : [];

  const racesByRound = new Map<number, Race>();
  for (const r of cal.races) racesByRound.set(r.round, r);

  const color = teamColor(standing.team);

  return (
    <main className="flex-1 w-full">
      <BackBar crumb="Drivers" crumbHref="/#drivers" label={upperCode} />

      <section className="section-y">
        <div className="container-max">
          <span className="eyebrow-red block">
            P{standing.position} · Driver Profile
          </span>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-10 items-end">
            <div className="min-w-0">
              <h1 className="headline h-detail">
                {profile?.givenName ? (
                  <>
                    {profile.givenName}{" "}
                    <em style={{ color, fontStyle: "italic" }}>
                      {profile.familyName}
                    </em>
                  </>
                ) : (
                  <em style={{ color, fontStyle: "italic" }}>
                    {standing.driver_name}
                  </em>
                )}
              </h1>
              <div className="mt-5 flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="chip" style={{ borderColor: color, color }}>
                  {upperCode}
                </span>
                <Link
                  href={`/constructors/${teamSlug(standing.team)}`}
                  className="chip hover:border-ink transition-colors"
                >
                  {teamShort(standing.team)}
                </Link>
                {profile?.permanentNumber && (
                  <span className="chip text-muted">
                    №{profile.permanentNumber}
                  </span>
                )}
                {profile?.nationality && (
                  <span className="chip text-muted">
                    {profile.nationality}
                  </span>
                )}
              </div>
            </div>

            <div
              aria-hidden
              className="w-full lg:w-[280px] h-[6px]"
              style={{ background: color }}
            />
          </div>

          <div className="rule-thin mt-10" />

          <div className="mt-8 stat-strip grid-cols-2 md:grid-cols-4">
            <Stat label="Position" value={`P${standing.position}`} />
            <Stat label="Points" value={String(standing.points)} />
            <Stat label="Wins" value={String(standing.wins)} />
            <Stat
              label="Born"
              value={
                profile?.dateOfBirth
                  ? formatRaceDate(profile.dateOfBirth) +
                    ", " +
                    profile.dateOfBirth.slice(0, 4)
                  : "\u2014"
              }
            />
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-max">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="headline h-subsection">
              Season <em>Form</em>
            </h2>
            <span className="eyebrow">2026 · {seasonResults.length} rounds logged</span>
          </div>
          <div className="rule-thin mt-4" />

          {seasonResults.length === 0 ? (
            <p className="mt-8 text-sm text-muted">
              No race results recorded yet for this driver in 2026.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto no-scrollbar -mx-[var(--gutter-x)] md:mx-0 px-[var(--gutter-x)] md:px-0">
              <table className="w-full border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-left">
                    <Th>R</Th>
                    <Th>Race</Th>
                    <Th>Grid</Th>
                    <Th>Finish</Th>
                    <Th>Pts</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {seasonResults.map((race) => {
                    const result = race.Results?.[0];
                    if (!result) return null;
                    const round = Number(race.round);
                    const calRace = racesByRound.get(round);
                    return (
                      <tr key={round} className="row-hover border-t border-rule">
                        <Td mono>{String(round).padStart(2, "0")}</Td>
                        <Td>
                          <Link
                            href={`/races/${round}`}
                            className="hover:text-f1 transition-colors"
                          >
                            <span className="font-display italic">
                              {race.raceName}
                            </span>
                            {calRace && (
                              <span className="ml-2 eyebrow text-muted">
                                {countryCode(calRace.country)}
                              </span>
                            )}
                          </Link>
                        </Td>
                        <Td mono>{result.grid}</Td>
                        <Td mono>
                          <span
                            style={{
                              color:
                                Number(result.position) <= 3 ? color : undefined,
                              fontWeight: Number(result.position) <= 3 ? 600 : undefined,
                            }}
                          >
                            P{result.position}
                          </span>
                        </Td>
                        <Td mono>{result.points}</Td>
                        <Td>
                          <span className="eyebrow">{result.status}</span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 text-[11px] text-muted leading-relaxed">
            Race results sourced via the Jolpica F1 (Ergast-compatible) public
            API. Standings come from the lightsout-api backend.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="eyebrow">{label}</span>
      <span className="font-display text-[clamp(1.75rem,4vw,2.4rem)] leading-none">
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
