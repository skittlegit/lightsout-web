import Countdown from "./Countdown";
import LocalStartTime from "./LocalStartTime";
import { TrackOutline } from "./CircuitVisual";
import type { Race } from "@/lib/types";
import { splitRaceName, formatRaceFullDate, countryCode, raceStartISO } from "@/lib/format";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  race: Race;
  totalRounds: number;
  /** Jolpica circuitId, for the track outline. */
  circuitId?: string;
}

/** Next-race feature card: title, key facts, track map, countdown. */
export default function Hero({ race, totalRounds, circuitId }: Props) {
  const { head, tail } = splitRaceName(race.race_name);
  const target = raceStartISO(race.race_date, race.race_time);
  const round = String(race.round).padStart(2, "0");

  return (
    <section className="pt-6 md:pt-8">
      <div className="container-max">
        <div className="panel-carbon overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-8 p-6 sm:p-8 md:p-10">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="chip chip-red">
                  <span className="pulse-dot inline-block w-[6px] h-[6px] rounded-full bg-f1" />
                  Next race
                </span>
                <span className="chip">Round {round} of {totalRounds}</span>
                {race.has_sprint && <span className="chip">Sprint weekend</span>}
              </div>

              <h1 className="headline h-hero mt-6">
                <Link href={`/races/${race.round}` as Route} className="headline-link">
                  {head}
                  {tail && <span className="text-muted"> {tail}</span>}
                </Link>
              </h1>

              <dl className="mt-7 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 max-w-2xl">
                <Fact label="Circuit" value={race.circuit} />
                <Fact label="Country" value={`${race.country} · ${countryCode(race.country)}`} />
                {race.race_time ? (
                  <Fact label="Lights out (your time)" value={<LocalStartTime iso={target} />} />
                ) : (
                  <Fact label="Race day" value={formatRaceFullDate(race.race_date)} />
                )}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/races/${race.round}` as Route} className="btn btn-primary">
                  Race details <span aria-hidden>→</span>
                </Link>
                <Link href="/forecast" className="btn btn-ghost">
                  Forecast
                </Link>
              </div>
            </div>

            {circuitId && (
              <div className="hidden sm:flex items-center justify-center">
                <TrackOutline circuitId={circuitId} label={race.circuit} className="w-full h-auto max-w-[480px]" />
              </div>
            )}
          </div>

          <div className="border-t border-rule px-6 sm:px-8 md:px-10 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <span className="text-sm text-muted shrink-0">Lights out in</span>
            <Countdown targetISO={target} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[12.5px] text-muted">{label}</dt>
      <dd className="text-[15px] text-ink leading-snug">{value}</dd>
    </div>
  );
}
