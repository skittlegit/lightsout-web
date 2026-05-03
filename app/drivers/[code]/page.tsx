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

  // race lookup for display joins
  const racesByRound = new Map<number, Race>();
  for (const r of cal.races) racesByRound.set(r.round, r);

  const color = teamColor(standing.team);

  return (
    <main className="flex-1 w-full">
      <BackBar crumb="Drivers" crumbHref="/#drivers" label={upperCode} />

      <section className="px-6 md:px-10 py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow-red block">
            P{standing.position} · Driver Profile
          </span>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-end">
            <div>
              <h1 className="headline text-[14vw] md:text-[7rem] leading-[0.9]">
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
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <span
                  className="font-mono tabular text-[11px] tracking-[0.16em] px-2 py-1 border"
                  style={{
                    borderColor: color,
                    color,
                  }}
                >
                  {upperCode}
                </span>
                <Link
                  href={`/constructors/${teamSlug(standing.team)}`}
                  className="font-mono tabular text-[11px] tracking-[0.16em] px-2 py-1 border border-rule hover:border-ink transition-colors"
                >
                  {teamShort(standing.team)}
                </Link>
                {profile?.permanentNumber && (
                  <span className="font-mono tabular text-[11px] tracking-[0.16em] text-muted">
                    №{profile.permanentNumber}
                  </span>
                )}
                {profile?.nationality && (
                  <span className="font-mono tabular text-[11px] tracking-[0.16em] text-muted">
                    {profile.nationality}
                  </span>
                )}
              </div>
            </div>

            <div
              aria-hidden
              className="w-full lg:w-[280px] h-2"
              style={{ background: color }}
            />
          </div>

          <div className="rule-thin mt-10" />

          {/* Stat strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8">
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
                  : "—"
              }
            />
          </div>
        </div>
      </section>

      {/* Season results */}
      <section className="px-6 md:px-10 pb-16 md:pb-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="headline text-[10vw] md:text-[3rem]">
              Season <em>Form</em>
            </h2>
            <span className="eyebrow">2026 · {seasonResults.length} ROUNDS LOGGED</span>
          </div>
          <div className="rule-thin mt-4" />

          {seasonResults.length === 0 ? (
            <p className="mt-8 text-sm text-muted">
              No race results recorded yet for this driver in 2026.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto no-scrollbar">
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
                    const cal = racesByRound.get(round);
                    return (
                      <tr key={round} className="border-t border-rule">
                        <Td mono>{String(round).padStart(2, "0")}</Td>
                        <Td>
                          <Link
                            href={`/races/${round}`}
                            className="hover:text-f1 transition-colors"
                          >
                            <span className="font-display italic">
                              {race.raceName}
                            </span>
                            {cal && (
                              <span className="ml-2 eyebrow text-muted">
                                {countryCode(cal.country)}
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
    <div className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <span className="font-display text-[28px] md:text-[36px] leading-none">
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
