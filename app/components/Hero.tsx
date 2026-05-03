import Countdown from "./Countdown";
import type { Race } from "@/lib/types";
import { splitRaceName, formatRaceFullDate } from "@/lib/format";

interface Props {
  race: Race;
  totalRounds: number;
}

function targetISO(race: Race): string {
  // Default to 13:00 UTC on race day if API didn't supply a time.
  const time = race.race_time ?? "13:00:00Z";
  // race_date is "YYYY-MM-DD"
  const t = time.endsWith("Z") ? time : `${time}Z`;
  return `${race.race_date}T${t}`;
}

export default function Hero({ race, totalRounds }: Props) {
  const { head, tail } = splitRaceName(race.name);
  const target = targetISO(race);
  const roundLabel = `Round ${String(race.round).padStart(2, "0")} · Up Next`;

  const lapsKm =
    race.laps && race.distance_km
      ? `Round ${race.round} of ${totalRounds} · ${race.laps} laps · ${race.distance_km.toFixed(3)} km`
      : `Round ${race.round} of ${totalRounds}`;

  return (
    <section id="next" className="px-6 md:px-10 pt-6 pb-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-ink text-paper p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16">
          {/* LEFT */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="eyebrow-red">{roundLabel}</span>
              <span className="inline-flex items-center gap-2 border border-paper/20 px-2 py-1">
                <span className="pulse-dot inline-block w-[6px] h-[6px] rounded-full bg-f1" />
                <span className="font-mono text-[10px] tracking-[0.16em] text-paper">
                  {race.country_code}
                </span>
              </span>
            </div>

            <h2 className="headline text-paper mt-8 text-[14vw] md:text-[8.5rem] leading-[0.9]">
              {head}
              {tail && (
                <>
                  {" "}
                  <em className="text-f1">{tail}</em>
                </>
              )}
            </h2>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10 max-w-3xl">
              <Field label="Circuit" value={race.circuit_name} />
              <Field label="Location" value={`${race.locality}, ${race.country}`} />
              <Field label="Format" value={lapsKm} mono />
              {race.lap_record && (
                <Field
                  label="Lap Record"
                  value={`${race.lap_record.time} · ${race.lap_record.driver} (${race.lap_record.year})`}
                  mono
                />
              )}
              {race.prior_pole && (
                <Field
                  label="Prior Pole"
                  value={`${race.prior_pole.driver_name} · ${race.prior_pole.team}`}
                />
              )}
              <Field
                label="Race Day"
                value={formatRaceFullDate(race.race_date)}
                mono
              />
            </div>
          </div>

          {/* RIGHT — countdown */}
          <div className="lg:border-l lg:border-paper/15 lg:pl-12 flex lg:items-end">
            <Countdown targetISO={target} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="eyebrow text-paper/50">{label}</span>
      <span
        className={`text-paper text-sm md:text-base leading-snug ${
          mono ? "font-mono tabular" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
