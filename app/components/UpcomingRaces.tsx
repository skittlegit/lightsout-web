import Link from "next/link";
import type { Route } from "next";
import type { Race } from "@/lib/types";
import { countryCode, raceStartISO } from "@/lib/format";
import LocalStartTime from "./LocalStartTime";

const DAY = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

/** Schedule cards for the next few rounds: big date, country, circuit, start time. */
export default function UpcomingRaces({ races }: { races: Race[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {races.map((r) => {
        const date = new Date(`${r.race_date}T00:00:00Z`);
        return (
          <Link key={r.round} href={`/races/${r.round}` as Route} className="card p-5 flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow">Round {String(r.round).padStart(2, "0")}</span>
              {r.has_sprint && <span className="chip">Sprint</span>}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-[40px] leading-none tabular">{DAY.format(date)}</span>
              <span className="eyebrow">{MONTH.format(date)}</span>
            </div>
            <div className="mt-auto pt-5">
              <div className="flex items-baseline gap-2">
                <span className="font-display italic text-[22px] leading-tight">{r.country}</span>
                <span className="eyebrow">{countryCode(r.country)}</span>
              </div>
              <div className="text-[13.5px] text-muted truncate mt-0.5">{r.circuit}</div>
              {r.race_time && (
                <div className="font-mono text-[11.5px] text-ink-soft mt-3 pt-3 border-t border-rule">
                  <LocalStartTime iso={raceStartISO(r.race_date, r.race_time)} />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
