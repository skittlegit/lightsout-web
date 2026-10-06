import Link from "next/link";
import type { Route } from "next";
import Countdown from "./Countdown";
import LocalStartTime from "./LocalStartTime";
import DriverName from "./DriverName";
import { TrackOutline } from "./Circuit";
import type { Race } from "@/lib/types";
import type { JolpicaRaceResult } from "@/lib/jolpica";
import { countryCode, formatRaceDate, formatRaceFullDate, raceStartISO, splitRaceName, teamColor } from "@/lib/format";

interface Props {
  race: Race;
  totalRounds: number;
  /** Jolpica circuitId, for the track outline. */
  circuitId?: string;
  previous: Race | null;
  previousWinner: JolpicaRaceResult | null;
  following: Race | null;
}

/**
 * Full-width race weekend band: race name, countdown and track map, with a
 * strip linking the previous round (and its winner) and the one after.
 */
export default function Hero({ race, totalRounds, circuitId, previous, previousWinner, following }: Props) {
  const { head, tail } = splitRaceName(race.race_name);
  const target = raceStartISO(race.race_date, race.race_time);

  return (
    <section className="panel-carbon panel-flat relative overflow-hidden">
      <div className="container-max grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 pt-10 md:pt-14 pb-10">
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip chip-red">
              <span className="pulse-dot inline-block w-[6px] h-[6px] rounded-full bg-white" />
              Next race
            </span>
            <span className="chip !bg-white/12 !text-white">Round {race.round} of {totalRounds}</span>
            {race.has_sprint && <span className="chip !bg-white/12 !text-white">Sprint weekend</span>}
          </div>

          <h1 className="mt-6">
            <Link href={`/races/${race.round}` as Route} className="group block">
              <span className="block font-display font-extrabold uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(3rem,9vw,7rem)] group-hover:text-f1-soft transition-colors">
                {head}
              </span>
              {tail && (
                <span className="block font-display font-bold text-white/60 text-[clamp(1.4rem,3.4vw,2.4rem)] mt-1">{tail}</span>
              )}
            </Link>
          </h1>

          <p className="mt-5 text-[16px] text-white/75">
            {race.circuit} · {race.country}
            <br />
            {race.race_time ? (
              <>Lights out <span className="text-white font-semibold"><LocalStartTime iso={target} /></span></>
            ) : (
              formatRaceFullDate(race.race_date)
            )}
          </p>

          <div className="mt-8">
            <Countdown targetISO={target} />
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/races/${race.round}` as Route} className="btn btn-primary">
              Race details <span aria-hidden>→</span>
            </Link>
            <Link href="/forecast" className="btn btn-ghost !border-white !text-white hover:!bg-white hover:!text-ink">
              Forecast
            </Link>
          </div>
        </div>

        {circuitId && (
          <div className="hidden sm:flex items-center justify-center">
            <TrackOutline circuitId={circuitId} label={race.circuit} className="w-full h-auto max-w-[620px]" />
          </div>
        )}
      </div>

      {/* Season rail: previous · this · next */}
      <div className="border-t border-white/10">
        <div className="container-max grid grid-cols-1 sm:grid-cols-3">
          <RailItem
            label="Previous"
            race={previous}
            detail={
              previousWinner ? (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="team-pip !h-4" style={{ background: teamColor(previousWinner.Constructor.name) }} />
                  <span>Won by <DriverName name={`${previousWinner.Driver.givenName} ${previousWinner.Driver.familyName}`} /></span>
                </span>
              ) : undefined
            }
          />
          <RailItem label="This round" race={race} active detail={formatRaceDate(race.race_date)} />
          <RailItem label="Up after" race={following} detail={following ? formatRaceDate(following.race_date) : undefined} />
        </div>
      </div>
    </section>
  );
}

function RailItem({
  label,
  race,
  detail,
  active,
}: {
  label: string;
  race: Race | null;
  detail?: React.ReactNode;
  active?: boolean;
}) {
  const body = (
    <>
      <span className={`text-[12px] font-bold uppercase tracking-[0.08em] ${active ? "text-f1-soft" : "text-white/55"}`}>{label}</span>
      <span className="font-display text-[17px] font-bold mt-1 truncate">
        {race ? `R${race.round} · ${race.race_name}` : "—"}
        {race && <span className="text-white/50 font-semibold"> {countryCode(race.country)}</span>}
      </span>
      {detail && <span className="text-[13.5px] text-white/70 mt-0.5 truncate">{detail}</span>}
    </>
  );
  const cls = `flex flex-col min-w-0 py-5 sm:px-6 sm:first:pl-0 border-b sm:border-b-0 sm:border-l sm:first:border-l-0 border-white/10 last:border-b-0 ${
    active ? "" : "hover:bg-white/[0.03] transition-colors"
  }`;
  return race ? (
    <Link href={`/races/${race.round}` as Route} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
