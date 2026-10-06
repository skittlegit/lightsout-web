import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import BackBar from "@/app/components/BackBar";
import SectionTitle from "@/app/components/SectionTitle";
import { BannerChip, BannerStat, TableCard } from "@/app/components/ui";
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
  return { title: `${code.toUpperCase()} · Driver` };
}

export default async function DriverPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const jolpicaId = driverIdFromCode(upperCode);

  const [standings, allDrivers, cal, mappedResults] = await Promise.all([
    getDriverStandings(),
    getDrivers(),
    getCalendar(),
    jolpicaId ? getDriverResults(jolpicaId) : Promise.resolve([]),
  ]);

  const standing = standings.find((d) => d.driver_code === upperCode);
  if (!standing) notFound();

  const profile = jolpicaId
    ? allDrivers.find((d) => d.driverId === jolpicaId)
    : allDrivers.find((d) => d.code?.toUpperCase() === upperCode);
  // Drivers missing from the static code map (e.g. mid-season substitutes)
  // still get their results via the ID from Jolpica's season driver list.
  const seasonResults = jolpicaId || !profile ? mappedResults : await getDriverResults(profile.driverId);

  const racesByRound = new Map<number, Race>();
  for (const r of cal.races) racesByRound.set(r.round, r);

  const color = teamColor(standing.team);
  const finishes = seasonResults.map((r) => Number(r.Results?.[0]?.position)).filter(Number.isFinite);
  const podiums = finishes.filter((p) => p <= 3).length;
  const given = profile?.givenName ?? standing.driver_name.split(" ").slice(0, -1).join(" ");
  const family = profile?.familyName ?? standing.driver_name.split(" ").at(-1);

  return (
    <main className="flex-1 w-full">
      <BackBar crumb="Drivers" crumbHref="/drivers" label={standing.driver_name} />

      <section className="pt-6">
        <div className="container-max">
          <div className="team-card p-6 sm:p-8 md:p-10" style={{ "--team": color } as CSSProperties}>
            <span
              aria-hidden
              className="absolute right-4 -bottom-8 font-display leading-none text-[clamp(9rem,22vw,16rem)] select-none"
              style={{ color: "color-mix(in srgb, var(--team) 70%, white)", opacity: 0.28 }}
            >
              {profile?.permanentNumber ?? ""}
            </span>

            <div className="relative">
              <span className="eyebrow">
                P{standing.position} in the {cal.season} championship
              </span>
              <h1 className="mt-3 font-display leading-[0.95]">
                <span className="block text-[clamp(1.4rem,3vw,2.2rem)] text-white/85">{given}</span>
                <span className="block uppercase text-[clamp(2.6rem,7vw,5rem)]">{family}</span>
              </h1>
              <div className="mt-5 flex items-center gap-2 flex-wrap">
                <Link href={`/constructors/${teamSlug(standing.team)}` as Route} className="chip hover:!border-[#faf7f2]">
                  {teamShort(standing.team)}
                </Link>
                {profile?.nationality && <BannerChip>{profile.nationality}</BannerChip>}
                <BannerChip>{upperCode}</BannerChip>
                <Link href={`/compare?a=${upperCode}` as Route} className="chip !bg-[#faf7f2] !border-[#faf7f2] !text-[#141414] hover:!bg-white">
                  Compare <span aria-hidden>→</span>
                </Link>
              </div>

              <dl className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-5 max-w-3xl">
                <BannerStat label="Points" value={String(standing.points)} />
                <BannerStat label="Wins" value={String(standing.wins)} />
                <BannerStat label="Podiums" value={String(podiums)} />
                <BannerStat label="Best finish" value={finishes.length ? `P${Math.min(...finishes)}` : "—"} />
                <BannerStat
                  label="Born"
                  value={profile?.dateOfBirth ? `${formatRaceDate(profile.dateOfBirth)} ${profile.dateOfBirth.slice(0, 4)}` : "—"}
                />
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-max">
          <SectionTitle kicker={`${cal.season} season`} title="Race by race" meta={`${seasonResults.length} rounds`} />
          {seasonResults.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No race results recorded yet for this driver in {cal.season}.</p>
          ) : (
            <div className="mt-6">
              <TableCard minWidth={640}>
                <thead>
                  <tr>
                    <th className="w-14">Rnd</th>
                    <th>Grand Prix</th>
                    <th className="num">Grid</th>
                    <th className="num">Finish</th>
                    <th className="num">Pts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonResults.map((race) => {
                    const result = race.Results?.[0];
                    if (!result) return null;
                    const round = Number(race.round);
                    const calRace = racesByRound.get(round);
                    const pos = Number(result.position);
                    return (
                      <tr key={round}>
                        <td className="font-display text-muted">{String(round).padStart(2, "0")}</td>
                        <td>
                          <Link href={`/races/${round}` as Route} className="font-semibold hover:text-f1 transition-colors">
                            {race.raceName}
                          </Link>
                          {calRace && <span className="ml-2 text-[12.5px] text-muted">{countryCode(calRace.country)}</span>}
                        </td>
                        <td className="num">{result.grid}</td>
                        <td className="num">
                          <span className={`pos-badge ${pos === 1 ? "pos-badge--lead" : ""} ${pos > 3 ? "!font-semibold" : ""}`}>
                            P{result.position}
                          </span>
                        </td>
                        <td className="num font-semibold">{result.points}</td>
                        <td className="text-muted text-[14px]">{result.status}</td>
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
