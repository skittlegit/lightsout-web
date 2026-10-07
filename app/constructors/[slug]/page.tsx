import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import BackBar from "@/app/components/BackBar";
import SectionTitle from "@/app/components/SectionTitle";
import { BannerChip, BannerStat, TableCard } from "@/app/components/ui";
import DriverName from "@/app/components/DriverName";
import { getConstructorStandings, getDriverStandings, getCalendar } from "@/lib/api";
import {
  getConstructors,
  getConstructorDrivers,
  getConstructorResults,
} from "@/lib/jolpica";
import type { JolpicaRaceResult } from "@/lib/jolpica";
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
  return { title: `${pretty} · Constructor` };
}

export default async function ConstructorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const teamId = teamFromSlug(slug);
  if (!teamId) notFound();

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
        crumb="Teams"
        crumbHref="/constructors"
        label={teamShort(standing.team)}
      />

      <section className="pt-6">
        <div className="container-max">
          <div className="team-card p-6 sm:p-8 md:p-10" style={{ "--team": color } as CSSProperties}>
            <span className="eyebrow">
              P{standing.position} in the constructors&apos; championship
            </span>
            <h1 className="mt-3 font-display leading-[0.95] text-[clamp(2.6rem,7vw,5rem)]">
              {teamShort(standing.team)}
            </h1>
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {standing.team !== teamShort(standing.team) && <BannerChip>{standing.team}</BannerChip>}
              {profile?.nationality && <BannerChip>{profile.nationality}</BannerChip>}
              {profile?.url && (
                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="chip hover:!border-[#faf7f2]">
                  Wikipedia ↗
                </a>
              )}
            </div>
            <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-2xl">
              <BannerStat label="Points" value={String(totalConstructorPoints)} />
              <BannerStat label="Wins" value={String(standing.wins)} />
              <BannerStat label="Position" value={`P${standing.position}`} />
              <BannerStat label="Drivers used" value={String(lineup.length)} />
            </dl>
          </div>
        </div>
      </section>

      {/* Lineup */}
      <section className="section-y">
        <div className="container-max">
          <SectionTitle kicker={`${calRes.season} season`} title="Drivers" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lineup.map(({ driver, code, standing: s }) => (
              <Link
                key={driver.driverId}
                href={(code ? `/drivers/${code.toLowerCase()}` : "/drivers") as Route}
                className="card p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span aria-hidden className="team-pip !h-10" style={{ background: color }} />
                  <div className="min-w-0">
                    <DriverName name={`${driver.givenName} ${driver.familyName}`} className="block text-[17px] truncate" />
                    <div className="text-[13px] text-muted mt-0.5">
                      {[code, driver.permanentNumber && `#${driver.permanentNumber}`, driver.nationality].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-[20px] tabular">{s ? s.points : "—"}</div>
                  <div className="text-[12px] text-muted">{s ? `P${s.position}` : "no standing"}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-4">
        <div className="container-max">
          <SectionTitle title="Race by race" meta={`${conResults.length} rounds`} />
          {conResults.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              No race results recorded yet for this team in {calRes.season}.
            </p>
          ) : (
            <div className="mt-6">
              <TableCard minWidth={680}>
                <thead>
                  <tr>
                    <th className="w-14">Rnd</th>
                    <th>Grand Prix</th>
                    <th>Best car</th>
                    <th>Second car</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {conResults.map((race) => {
                    const round = Number(race.round);
                    const cal = racesByRound.get(round);
                    const [a, b] = [...(race.Results ?? [])].sort((x, y) => Number(x.position) - Number(y.position));
                    const combined = (Number(a?.points ?? 0) || 0) + (Number(b?.points ?? 0) || 0);
                    return (
                      <tr key={round}>
                        <td className="font-display text-muted">{String(round).padStart(2, "0")}</td>
                        <td>
                          <Link href={`/races/${round}` as Route} className="font-semibold hover:text-f1 transition-colors">
                            {race.raceName}
                          </Link>
                          {cal && <span className="ml-2 text-[12.5px] text-muted">{countryCode(cal.country)}</span>}
                        </td>
                        <td><CarResult result={a} /></td>
                        <td><CarResult result={b} /></td>
                        <td className="num font-semibold">{combined}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableCard>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CarResult({ result }: { result?: JolpicaRaceResult }) {
  if (!result) return <span className="text-muted">—</span>;
  const pos = Number(result.position);
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`pos-badge ${pos === 1 ? "pos-badge--lead" : ""}`}>P{result.position}</span>
      <span className="text-[14px]">{result.Driver.code ?? result.Driver.familyName}</span>
    </span>
  );
}
