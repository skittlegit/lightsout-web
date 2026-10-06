import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/app/components/SectionTitle";
import { CardHead } from "@/app/components/DriversTable";
import ProgressionChart from "@/app/components/ProgressionChart";
import DriverName from "@/app/components/DriverName";
import { getCalendar, getConstructorStandings, getDriverStandings } from "@/lib/api";
import { getSeasonResults, getSeasonSprints } from "@/lib/jolpica";
import { pointsProgression } from "@/lib/season";
import { teamColor, teamShort } from "@/lib/format";
import { teamSlug } from "@/lib/slug";

export const revalidate = 600;
export const metadata = {
  title: "Standings",
  description: "Drivers' and constructors' championship standings with points progression.",
};

export default async function StandingsPage() {
  const [drivers, teams, cal, results, sprints] = await Promise.all([
    getDriverStandings(),
    getConstructorStandings(),
    getCalendar(),
    getSeasonResults(),
    getSeasonSprints(),
  ]);
  const done = cal.races.filter((r) => r.is_completed).length;
  const driverLeader = drivers[0]?.points ?? 0;
  const teamLeader = teams[0]?.points ?? 0;
  // Sprint data failing must not drop GP points from the chart, but a missing
  // results series means there is nothing honest to plot.
  const progression = results ? pointsProgression(results, sprints ?? [], 6) : null;

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker={`${cal.season} season · after round ${done} of ${cal.races.length}`}
        title="Championship standings"
        description={
          drivers[0] && drivers[1]
            ? `${drivers[0].driver_name} leads ${drivers[1].driver_name} by ${drivers[0].points - drivers[1].points} points with ${cal.races.length - done} rounds to go.`
            : undefined
        }
      />

      <div className="container-max flex flex-col gap-5">
        <div className="card overflow-hidden">
          <CardHead title="Points progression" meta={sprints ? "Top 6 · race + sprint points" : "Top 6 · Grand Prix points only"} />
          <div className="p-4 sm:p-6">
            {progression ? (
              <ProgressionChart data={progression} />
            ) : (
              <p className="text-sm text-muted">Round-by-round results are unavailable right now.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-5 items-start">
          <div id="drivers" className="card overflow-hidden">
            <CardHead title="Drivers" meta={`${drivers.length} drivers`} />
            <div className="overflow-x-auto">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    <th className="w-12">Pos</th>
                    <th>Driver</th>
                    <th>Team</th>
                    <th className="num">Wins</th>
                    <th className="num">Gap</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.driver_code}>
                      <td><span className={`pos-badge ${d.position === 1 ? "pos-badge--lead" : ""}`}>{d.position}</span></td>
                      <td>
                        <Link href={`/drivers/${d.driver_code.toLowerCase()}` as Route} className="flex items-center gap-3 hover:text-f1 transition-colors">
                          <span aria-hidden className="team-pip" style={{ background: teamColor(d.team) }} />
                          <DriverName name={d.driver_name} />
                          <span className="font-mono text-[12px] text-muted">{d.driver_code}</span>
                        </Link>
                      </td>
                      <td className="text-muted">{teamShort(d.team)}</td>
                      <td className="num">{d.wins}</td>
                      <td className="num text-muted">{d.position === 1 ? "—" : `−${driverLeader - d.points}`}</td>
                      <td className="num font-semibold">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div id="constructors" className="card overflow-hidden">
            <CardHead title="Teams" meta={`${teams.length} teams`} />
            <div className="overflow-x-auto">
              <table className="data-table min-w-[420px]">
                <thead>
                  <tr>
                    <th className="w-12">Pos</th>
                    <th>Team</th>
                    <th className="num">Wins</th>
                    <th className="num">Gap</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.team}>
                      <td><span className={`pos-badge ${t.position === 1 ? "pos-badge--lead" : ""}`}>{t.position}</span></td>
                      <td>
                        <Link href={`/constructors/${teamSlug(t.team)}` as Route} className="flex items-center gap-3 hover:text-f1 transition-colors">
                          <span aria-hidden className="team-pip" style={{ background: teamColor(t.team) }} />
                          <span className="font-medium">{teamShort(t.team)}</span>
                        </Link>
                      </td>
                      <td className="num">{t.wins}</td>
                      <td className="num text-muted">{t.position === 1 ? "—" : `−${teamLeader - t.points}`}</td>
                      <td className="num font-semibold">{t.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
