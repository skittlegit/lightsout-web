import Link from "next/link";
import { notFound } from "next/navigation";
import BackBar from "@/app/components/BackBar";
import Footer from "@/app/components/Footer";
import { getConstructorStandings, getDriverStandings, getCalendar } from "@/lib/api";
import {
  getConstructors,
  getConstructorDrivers,
  getConstructorResults,
} from "@/lib/jolpica";
import { constructorIdFromTeam, driverCodeFromId, teamFromSlug } from "@/lib/slug";
import { teamColor, teamShort, countryCode } from "@/lib/format";
import type { Race } from "@/lib/types";

export const revalidate = 600;

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const pretty = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: `${pretty} · Constructor · LightsOut` };
}

export default async function ConstructorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const teamId = teamFromSlug(slug);

  const [conStandings, drvStandings, calRes, jolpicaCons] = await Promise.all([
    getConstructorStandings(),
    getDriverStandings(),
    getCalendar(),
    getConstructors(),
  ]);

  const standing =
    conStandings.find(
      (c) =>
        constructorIdFromTeam(c.team) === constructorIdFromTeam(teamId.replace(/_/g, " "))
    ) ?? null;

  if (!standing) notFound();

  const conId = constructorIdFromTeam(standing.team);

  const [conDrivers, conResults] = await Promise.all([
    getConstructorDrivers(conId),
    getConstructorResults(conId),
  ]);

  const profile = jolpicaCons.find((c) => c.constructorId === conId);
  const color = teamColor(standing.team);

  const racesByRound = new Map<number, Race>();
  for (const r of calRes.races) racesByRound.set(r.round, r);

  // Pair driver code with standing for the lineup block
  const lineup = conDrivers
    .map((d) => {
      const code = (d.code ?? driverCodeFromId(d.driverId) ?? "").toUpperCase();
      const drvStanding = drvStandings.find(
        (s) => s.driver_code === code || s.driver_name.toLowerCase().includes(d.familyName.toLowerCase())
      );
      return { driver: d, code, standing: drvStanding };
    })
    .sort(
      (a, b) =>
        (b.standing?.points ?? -1) - (a.standing?.points ?? -1)
    );

  const totalConstructorPoints = standing.points;

  return (
    <main className="flex-1 w-full">
      <BackBar
        crumb="Constructors"
        crumbHref="/#constructors"
        label={teamShort(standing.team)}
      />

      <section className="section-y">
        <div className="container-max">
          <span className="eyebrow-red block">
            P{standing.position} · Constructor
          </span>

          <h1 className="headline h-detail mt-4">
            <em style={{ color, fontStyle: "italic" }}>
              {teamShort(standing.team)}
            </em>
          </h1>

          <div className="mt-5 flex items-center gap-2 sm:gap-3 flex-wrap">
            {profile?.nationality && (
              <span className="chip text-muted">{profile.nationality}</span>
            )}
            {profile?.url && (
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="chip hover:border-ink hover:text-ink transition-colors"
              >
                Reference ↗
              </a>
            )}
          </div>

          <div
            aria-hidden
            className="mt-8 h-[6px] w-full"
            style={{ background: color }}
          />

          <div className="rule-thin mt-10" />

          <div className="mt-8 stat-strip grid-cols-2 md:grid-cols-4">
            <Stat label="Position" value={`P${standing.position}`} />
            <Stat label="Points" value={String(totalConstructorPoints)} />
            <Stat label="Wins" value={String(standing.wins)} />
            <Stat label="Lineup" value={String(lineup.length)} />
          </div>
        </div>
      </section>

      {/* Lineup */}
      <section className="px-6 md:px-10 py-10">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="headline text-[10vw] md:text-[3rem]">
            Race <em>Lineup</em>
          </h2>
          <div className="rule-thin mt-4" />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {lineup.map(({ driver, code, standing: s }) => (
              <Link
                key={driver.driverId}
                href={code ? `/drivers/${code.toLowerCase()}` : "#"}
                className="group relative border border-rule p-6 hover-lift focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: color }}
                />
                <div className="pl-3 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-[24px] leading-tight truncate">
                      {driver.givenName}{" "}
                      <em className="italic" style={{ color }}>
                        {driver.familyName}
                      </em>
                    </div>
                    <div className="eyebrow mt-1.5">
                      {code || "—"}
                      {driver.permanentNumber && ` · №${driver.permanentNumber}`}
                      {driver.nationality && ` · ${driver.nationality}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono tabular text-[18px]">
                      {s ? s.points : "—"}
                    </span>
                    <span className="eyebrow ml-1">PTS</span>
                    <div className="eyebrow mt-1">
                      {s ? `P${s.position}` : "no standing"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-6 md:px-10 py-10 pb-16 md:pb-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="headline text-[10vw] md:text-[3rem]">
              Race <em>Log</em>
            </h2>
            <span className="eyebrow">{conResults.length} ROUNDS LOGGED</span>
          </div>
          <div className="rule-thin mt-4" />

          {conResults.length === 0 ? (
            <p className="mt-8 text-sm text-muted">
              No race results recorded yet for this constructor in 2026.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse min-w-[680px]">
                <thead>
                  <tr className="text-left">
                    <Th>R</Th>
                    <Th>Race</Th>
                    <Th>Driver A</Th>
                    <Th>Driver B</Th>
                    <Th>Combined Pts</Th>
                  </tr>
                </thead>
                <tbody>
                  {conResults.map((race) => {
                    const round = Number(race.round);
                    const cal = racesByRound.get(round);
                    const a = race.Results?.[0];
                    const b = race.Results?.[1];
                    const combined =
                      (Number(a?.points ?? 0) || 0) +
                      (Number(b?.points ?? 0) || 0);
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
                        <Td mono>
                          {a ? `${a.Driver.code ?? a.Driver.familyName} P${a.position}` : "—"}
                        </Td>
                        <Td mono>
                          {b ? `${b.Driver.code ?? b.Driver.familyName} P${b.position}` : "—"}
                        </Td>
                        <Td mono>{combined}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 text-[11px] text-muted leading-relaxed">
            Race results via Jolpica F1 (Ergast-compatible). Standings via the
            lightsout-api backend.
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
