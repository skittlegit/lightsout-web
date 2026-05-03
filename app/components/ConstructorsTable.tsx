import type { ConstructorStanding } from "@/lib/types";
import { teamColor } from "@/lib/format";
import { SectionHead } from "./DriversTable";

interface Props {
  teams: ConstructorStanding[];
}

export default function ConstructorsTable({ teams }: Props) {
  const leader = teams[0]?.points ?? 0;

  return (
    <div className="flex flex-col">
      <SectionHead num="02" headHTML="Constructors'" tail="Cup" />
      <ul className="mt-6 flex flex-col gap-4">
        {teams.map((t) => {
          const pct = leader > 0 ? t.points / leader : 0;
          return (
            <li key={t.team_id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-mono tabular text-[12px] text-muted w-6">
                    {String(t.position).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[18px] truncate">
                    {t.team}
                  </span>
                </div>
                <span className="font-mono tabular text-[14px] shrink-0">
                  {t.points}
                  <span className="eyebrow ml-1">PTS</span>
                </span>
              </div>
              <div className="h-[6px] bg-paper-deep">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.max(2, pct * 100)}%`,
                    background: teamColor(t.team_id),
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
