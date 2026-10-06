import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import type { JolpicaRaceResult } from "@/lib/jolpica";
import type { RaceRecap as Recap } from "@/lib/recap";
import { teamColor, teamShort } from "@/lib/format";
import { StripStat } from "./ui";

/** Podium as team-colour cards plus the race's key facts. */
export default function RaceRecap({ results, recap }: { results: JolpicaRaceResult[]; recap: Recap }) {
  const top3 = [...results].sort((a, b) => Number(a.position) - Number(b.position)).slice(0, 3);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((r, i) => (
          <PodiumCard key={r.Driver.driverId} r={r} rank={i + 1} />
        ))}
      </div>
      <div className="mt-4 stat-strip grid-cols-2 lg:grid-cols-4">
        <StripStat label="Pole" value={recap.pole?.Driver.familyName ?? "—"} note={recap.pole ? "Started P1" : undefined} />
        <StripStat label="Fastest lap" value={recap.fastestLap?.Driver.familyName ?? "—"} note={recap.fastestLapTime ?? undefined} />
        <StripStat
          label="Biggest mover"
          value={recap.biggestMover?.result.Driver.familyName ?? "—"}
          note={recap.biggestMover ? `+${recap.biggestMover.gained} places` : undefined}
        />
        <StripStat label="Retirements" value={String(recap.dnfs)} note={`${recap.classified} classified`} />
      </div>
    </>
  );
}

function PodiumCard({ r, rank }: { r: JolpicaRaceResult; rank: number }) {
  const code = r.Driver.code ?? "";
  const gap = rank === 1 ? r.Time?.time ?? "Winner" : r.Time?.time ?? r.status;
  return (
    <Link
      href={(code ? `/drivers/${code.toLowerCase()}` : "/drivers") as Route}
      className="team-card p-5 flex flex-col gap-6 min-h-[170px]"
      style={{ "--team": teamColor(r.Constructor.name) } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-[34px] font-extrabold leading-none">P{rank}</span>
        <span className="font-display font-bold text-[15px] text-white/85 tabular">{gap}</span>
      </div>
      <div className="mt-auto">
        <div className="text-[15px] text-white/85 leading-tight">{r.Driver.givenName}</div>
        <div className="font-display text-[22px] font-extrabold uppercase leading-tight">{r.Driver.familyName}</div>
        <div className="mt-1 text-[13px] text-white/75">{teamShort(r.Constructor.name)}</div>
      </div>
    </Link>
  );
}
