import type { ConstructorStanding } from "@/lib/types";
import { teamColor, teamShort } from "@/lib/format";
import { teamSlug } from "@/lib/slug";
import { SectionHead } from "./DriversTable";
import Link from "next/link";

interface Props {
  teams: ConstructorStanding[];
}

export default function ConstructorsTable({ teams }: Props) {
  const leader = teams[0]?.points ?? 0;

  return (
    <div className="flex flex-col">
      <SectionHead num="02" headHTML="Constructors'" tail="Cup" />
      <ul className="mt-5 flex flex-col gap-3">
        {teams.map((t) => {
          const ratio = leader > 0 ? t.points / leader : 0;
          const color = teamColor(t.team);
          return (
            <li key={t.team} className="flex flex-col gap-1.5 group">
              <Link
                href={`/constructors/${teamSlug(t.team)}`}
                className="flex items-baseline justify-between gap-3"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-mono tabular text-[12px] text-muted w-7 shrink-0">
                    {String(t.position).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[18px] truncate group-hover:text-f1 transition-colors">
                    {teamShort(t.team)}
                  </span>
                </div>
                <span className="font-mono tabular text-[14px] shrink-0">
                  {t.points}
                  <span className="eyebrow ml-1">PTS</span>
                </span>
              </Link>
              <div className="h-[5px] bg-paper-deep relative overflow-hidden">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${Math.max(2, ratio * 100)}%`,
                    background: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
