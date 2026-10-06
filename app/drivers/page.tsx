import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { PageHeader } from "@/app/components/SectionTitle";
import { getDriverStandings, SEASON } from "@/lib/api";
import { getDrivers } from "@/lib/jolpica";
import { teamColor, teamShort } from "@/lib/format";

export const revalidate = 600;
export const metadata = {
  title: "Drivers",
  description: "Every driver on the Formula 1 grid with championship position and points.",
};

export default async function DriversPage() {
  const [standings, profiles] = await Promise.all([getDriverStandings(), getDrivers()]);
  const byCode = new Map(profiles.filter((p) => p.code).map((p) => [p.code!.toUpperCase(), p]));

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker={`${SEASON} grid`}
        title="Drivers"
        description={`${standings.length} drivers this season, ordered by championship position.`}
      />
      <div className="container-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {standings.map((d) => {
          const p = byCode.get(d.driver_code);
          const given = p?.givenName ?? d.driver_name.split(" ").slice(0, -1).join(" ");
          const family = p?.familyName ?? d.driver_name.split(" ").at(-1);
          return (
            <Link
              key={d.driver_code}
              href={`/drivers/${d.driver_code.toLowerCase()}` as Route}
              className="team-card p-5 flex flex-col min-h-[200px]"
              style={{ "--team": teamColor(d.team) } as CSSProperties}
            >
              {/* Car number, large and tinted, behind the content */}
              <span
                aria-hidden
                className="absolute -right-1 -bottom-4 font-display font-extrabold leading-none text-[118px] select-none"
                style={{ color: "color-mix(in srgb, var(--team) 70%, white)", opacity: 0.32 }}
              >
                {p?.permanentNumber ?? ""}
              </span>

              <div className="relative flex items-start justify-between gap-3">
                <span className="font-display text-[26px] font-extrabold leading-none">{d.position}</span>
                <span className="text-right">
                  <span className="block font-display text-[18px] font-extrabold leading-none">{d.points}</span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 mt-1">Pts</span>
                </span>
              </div>

              <div className="relative mt-auto pt-10">
                <div className="text-[15px] text-white/85 leading-tight">{given}</div>
                <div className="font-display text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em]">{family}</div>
                <div className="mt-2 text-[13px] text-white/75">
                  {teamShort(d.team)}
                  {p?.nationality ? ` · ${p.nationality}` : ""}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
