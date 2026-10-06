import Link from "next/link";
import type { Route } from "next";
import type { Race } from "@/lib/types";
import { countryCode, formatRaceDate } from "@/lib/format";

/** The next few rounds as small cards. */
export default function UpcomingRaces({ races }: { races: Race[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {races.map((r) => (
        <Link key={r.round} href={`/races/${r.round}` as Route} className="card p-4 sm:p-5 flex flex-col gap-3 min-h-[150px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12px] text-muted">R{String(r.round).padStart(2, "0")} · {countryCode(r.country)}</span>
            {r.is_next ? (
              <span className="chip chip-red !h-6 !text-[11px]">Next</span>
            ) : r.has_sprint ? (
              <span className="chip !h-6 !text-[11px]">Sprint</span>
            ) : null}
          </div>
          <div className="mt-auto">
            <div className="font-display text-[17px] font-semibold leading-tight">{r.country}</div>
            <div className="text-[13px] text-muted mt-0.5 truncate">{r.circuit}</div>
            <div className="font-mono text-[12.5px] text-ink-soft mt-2">{formatRaceDate(r.race_date)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
