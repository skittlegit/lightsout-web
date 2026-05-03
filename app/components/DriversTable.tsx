import type { DriverStanding } from "@/lib/types";
import { abbreviateName, teamColor, teamShort } from "@/lib/format";
import Link from "next/link";

interface Props {
  drivers: DriverStanding[];
}

export default function DriversTable({ drivers }: Props) {
  const top = drivers.slice(0, 10);
  const leader = top[0]?.points ?? 0;

  return (
    <div className="flex flex-col">
      <SectionHead num="01" headHTML="Drivers'" tail="Championship" />
      <ul className="mt-5 flex flex-col">
        {top.map((d) => {
          const ratio = leader > 0 ? d.points / leader : 0;
          const color = teamColor(d.team);
          return (
            <li
              key={d.driver_code}
              className="row-hover relative grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-3 items-center py-3 border-b border-rule last:border-b-0 group"
            >
              {/* Team-color leading edge — thickens on hover */}
              <span
                aria-hidden
                className="absolute left-0 top-3 bottom-3 w-[3px] group-hover:w-[4px] transition-[width] duration-150"
                style={{ background: color }}
              />
              <span className="font-mono tabular text-[12px] text-muted pl-3">
                {String(d.position).padStart(2, "0")}
              </span>

              <Link
                href={`/drivers/${d.driver_code.toLowerCase()}`}
                className="min-w-0"
              >
                <div className="font-display text-[19px] leading-tight truncate group-hover:text-f1 transition-colors">
                  {abbreviateName(d.driver_name)}
                </div>
                <div className="eyebrow mt-0.5 truncate">
                  {teamShort(d.team)} · {d.driver_code}
                </div>
              </Link>

              <div className="flex flex-col items-end gap-1.5 min-w-[88px]">
                <span className="font-mono tabular text-[15px]">
                  {d.points}
                  <span className="eyebrow ml-1">PTS</span>
                </span>
                <div className="w-[88px] h-[3px] bg-paper-deep">
                  <div
                    className="h-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max(2, ratio * 100)}%`,
                      background: color,
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
      <h3 className="headline h-subsection mt-2">
        {headHTML} <em>{tail}</em>
      </h3>
      <div className="rule-thin mt-4" />
    </div>
  );
}
