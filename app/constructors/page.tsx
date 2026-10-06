import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { PageHeader } from "@/app/components/SectionTitle";
import DriverName from "@/app/components/DriverName";
import { getConstructorStandings, getDriverStandings, SEASON } from "@/lib/api";
import { teamColor, teamId, teamShort } from "@/lib/format";
import { teamSlug } from "@/lib/slug";

export const revalidate = 600;
export const metadata = {
  title: "Teams",
  description: "Every Formula 1 constructor with its drivers, points and wins.",
};

export default async function TeamsPage() {
  const [teams, drivers] = await Promise.all([getConstructorStandings(), getDriverStandings()]);
  const leader = teams[0]?.points ?? 0;

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker={`${SEASON} constructors`}
        title="Teams"
        description={`${teams.length} teams, ordered by the constructors' championship.`}
      />
      <div className="container-max grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map((t) => {
          const lineup = drivers.filter((d) => teamId(d.team) === teamId(t.team));
          return (
            <Link
              key={t.team}
              href={`/constructors/${teamSlug(t.team)}` as Route}
              className="team-card p-6 flex flex-col gap-5"
              style={{ "--team": teamColor(t.team) } as CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-display text-[15px] text-white/70">P{t.position}</span>
                  <div className="font-display text-[26px] leading-tight truncate">{teamShort(t.team)}</div>
                  {t.team !== teamShort(t.team) && <div className="text-[13px] text-white/70 truncate">{t.team}</div>}
                </div>
                <span className="text-right shrink-0">
                  <span className="block font-display text-[26px] leading-none">{t.points}</span>
                  <span className="block eyebrow mt-1">Pts</span>
                </span>
              </div>

              <div className="h-[4px] rounded-full bg-white/15 overflow-hidden" aria-hidden>
                <div className="h-full rounded-full bg-white" style={{ width: `${leader ? Math.max(2, (t.points / leader) * 100) : 0}%` }} />
              </div>

              <ul className="flex flex-col gap-2 border-t border-white/15 pt-4">
                {lineup.map((d) => (
                  <li key={d.driver_code} className="flex items-center justify-between gap-3 text-[15px]">
                    <DriverName name={d.driver_name} className="truncate" />
                    <span className="font-display text-white/80 tabular">{d.points}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto text-[13px] text-white/70">
                {t.wins} win{t.wins === 1 ? "" : "s"} this season
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
