import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import type { DriverStanding } from "@/lib/types";
import type { JolpicaDriver } from "@/lib/jolpica";
import { teamColor, teamShort } from "@/lib/format";

/**
 * Team-colour driver card (formula1.com style): position, points, name with
 * the surname in capitals, and the car number large in the background.
 * `size="lg"` is the championship leader on the home page.
 */
export default function DriverCard({
  standing,
  profile,
  size = "md",
}: {
  standing: DriverStanding;
  profile?: JolpicaDriver;
  size?: "md" | "lg";
}) {
  const given = profile?.givenName ?? standing.driver_name.split(" ").slice(0, -1).join(" ");
  const family = profile?.familyName ?? standing.driver_name.split(" ").at(-1);
  const lg = size === "lg";

  return (
    <Link
      href={`/drivers/${standing.driver_code.toLowerCase()}` as Route}
      className={`team-card flex flex-col ${lg ? "p-6 sm:p-7 min-h-[260px]" : "p-5 min-h-[200px]"}`}
      style={{ "--team": teamColor(standing.team) } as CSSProperties}
    >
      {/* Car number, large and tinted, behind the content */}
      <span
        aria-hidden
        className={`absolute -right-1 -bottom-4 font-display font-extrabold leading-none select-none ${lg ? "text-[180px]" : "text-[118px]"}`}
        style={{ color: "color-mix(in srgb, var(--team) 70%, white)", opacity: 0.2 }}
      >
        {profile?.permanentNumber ?? ""}
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <span className={`font-display font-extrabold leading-none ${lg ? "text-[40px]" : "text-[26px]"}`}>
          {standing.position}
        </span>
        <span className="text-right">
          <span className={`block font-display font-extrabold leading-none ${lg ? "text-[28px]" : "text-[18px]"}`}>
            {standing.points}
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 mt-1">Pts</span>
        </span>
      </div>

      <div className="relative mt-auto pt-10">
        <div className={`text-white/85 leading-tight ${lg ? "text-[18px]" : "text-[15px]"}`}>{given}</div>
        <div className={`font-display font-extrabold uppercase leading-tight tracking-[-0.01em] ${lg ? "text-[clamp(1.9rem,3.5vw,2.6rem)]" : "text-[24px]"}`}>
          {family}
        </div>
        <div className="mt-2 text-[13px] text-white/75">
          {teamShort(standing.team)}
          {profile?.nationality ? ` · ${profile.nationality}` : ""}
          {lg && standing.wins > 0 ? ` · ${standing.wins} wins` : ""}
        </div>
      </div>
    </Link>
  );
}
