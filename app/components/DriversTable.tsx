import type { DriverStanding } from "@/lib/types";
import { abbreviateName, teamColor } from "@/lib/format";

interface Props {
  drivers: DriverStanding[];
}

export default function DriversTable({ drivers }: Props) {
  const top = drivers.slice(0, 10);
  const leader = top[0]?.points ?? 0;

  return (
    <div className="flex flex-col">
      <SectionHead num="01" headHTML="Drivers'" tail="Championship" />
      <ul className="mt-6 flex flex-col">
        {top.map((d) => {
          const pct = leader > 0 ? d.points / leader : 0;
          return (
            <li
              key={d.driver_code}
              className="relative grid grid-cols-[1.5rem_1fr_auto] gap-3 items-center py-3 border-b border-rule last:border-b-0"
            >
              {/* 3px team-color leading edge */}
              <span
                aria-hidden
                className="absolute left-0 top-3 bottom-3 w-[3px]"
                style={{ background: teamColor(d.team_id) }}
              />
              <span className="font-mono tabular text-[12px] text-muted pl-2">
                {String(d.position).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div className="font-display text-[19px] leading-tight truncate">
                  {abbreviateName(d.driver_name)}
                </div>
                <div className="eyebrow mt-0.5 truncate">
                  {d.team} · {d.driver_code}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 min-w-[88px]">
                <span className="font-mono tabular text-[15px]">
                  {d.points}
                  <span className="eyebrow ml-1">PTS</span>
                </span>
                <div className="w-[88px] h-[3px] bg-paper-deep">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(2, pct * 100)}%`,
                      background: teamColor(d.team_id),
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SectionHead({
  num,
  headHTML,
  tail,
}: {
  num: string;
  headHTML: string;
  tail: string;
}) {
  return (
    <div>
      <span className="eyebrow-red block">§ {num}</span>
      <h3 className="headline mt-2 text-[8vw] md:text-[2.5rem] leading-[0.95]">
        {headHTML} <em>{tail}</em>
      </h3>
      <div className="rule-thin mt-4" />
    </div>
  );
}
