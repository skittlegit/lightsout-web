import type { ConstructorStanding } from "@/lib/types";
import { teamColor, teamShort } from "@/lib/format";
import { teamSlug } from "@/lib/slug";
import { CardHead } from "./DriversTable";
import Link from "next/link";

interface Props {
  teams: ConstructorStanding[];
}

/** Constructors' standings with points bars scaled to the leader. */
export default function ConstructorsTable({ teams }: Props) {
  const leader = teams[0]?.points ?? 0;

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <CardHead title="Teams" action={{ href: "/constructors", label: "All teams" }} />
      <ol className="flex flex-col px-4 sm:px-5 py-2">
        {teams.map((t) => {
          const ratio = leader > 0 ? t.points / leader : 0;
          const color = teamColor(t.team);
          return (
            <li key={t.team}>
              <Link
                href={`/constructors/${teamSlug(t.team)}`}
                className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-2"
              >
                <span className={`pos-badge ${t.position === 1 ? "pos-badge--lead" : ""}`}>{t.position}</span>
                <span className="text-[14.5px] font-medium truncate group-hover:text-f1 transition-colors">
                  {teamShort(t.team)}
                </span>
                <span className="font-mono tabular text-[14px] font-semibold">{t.points}</span>
                <span aria-hidden />
                <span aria-hidden className="col-span-2 h-[5px] rounded-full bg-paper-deeper overflow-hidden">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.max(2, ratio * 100)}%`, background: color }}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
