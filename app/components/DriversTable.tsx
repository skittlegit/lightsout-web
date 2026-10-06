import type { DriverStanding } from "@/lib/types";
import { teamColor, teamShort } from "@/lib/format";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import DriverName from "./DriverName";

interface Props {
  drivers: DriverStanding[];
  limit?: number;
}

/** Compact drivers' standings: position, team colour, name, gap, points. */
export default function DriversTable({ drivers, limit = 10 }: Props) {
  const top = drivers.slice(0, limit);
  const leader = top[0]?.points ?? 0;

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <CardHead title="Drivers" action={{ href: "/standings", label: "Full standings" }} />
      <ol className="flex flex-col">
        {top.map((d) => {
          const lead = d.position === 1;
          return (
            <li key={d.driver_code} className="border-b border-rule last:border-b-0">
              <Link
                href={`/drivers/${d.driver_code.toLowerCase()}`}
                className="row-hover grid grid-cols-[28px_4px_minmax(0,1fr)_auto_3.5rem] items-center gap-3 px-4 sm:px-5 py-2.5"
              >
                <span className={`pos-badge ${lead ? "pos-badge--lead" : ""}`}>{d.position}</span>
                <span aria-hidden className="team-pip" style={{ background: teamColor(d.team) }} />
                <span className="min-w-0">
                  <DriverName name={d.driver_name} className="block truncate text-[15px]" />
                  <span className="block text-[12.5px] text-muted truncate">{teamShort(d.team)}</span>
                </span>
                <span className="font-mono tabular text-[12px] text-muted text-right">
                  {lead ? "Leader" : `−${leader - d.points}`}
                </span>
                <span className="font-mono tabular text-[14.5px] font-semibold text-right">{d.points}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Card header used by the home-page cards: title + optional link onward. */
export function CardHead({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 h-14 border-b border-rule">
      <h3 className="font-display text-[16px] font-semibold">{title}</h3>
      {action ? (
        <Link href={action.href as Route} className="more-link !text-[13px]">
          {action.label} <span aria-hidden>→</span>
        </Link>
      ) : meta ? (
        <span className="text-[13px] text-muted">{meta}</span>
      ) : null}
    </div>
  );
}
