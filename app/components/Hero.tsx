import Countdown from "./Countdown";
import ShiftLights from "./ShiftLights";
import type { Race } from "@/lib/types";
import { splitRaceName, formatRaceFullDate, countryCode } from "@/lib/format";
import Link from "next/link";

interface Props {
  race: Race;
  totalRounds: number;
}

function targetISO(race: Race): string {
  // Backend supplies date only; default to 13:00 UTC on race day.
  return `${race.race_date}T13:00:00Z`;
}

export default function Hero({ race, totalRounds }: Props) {
  const { head, tail } = splitRaceName(race.race_name);
  const target = targetISO(race);
  const code = countryCode(race.country);

  return (
    <section id="next" className="pt-2 pb-12 md:pb-16">
      <div className="container-max">
        <div className="bg-ink text-paper relative overflow-hidden">
          {/* chevron racing texture + scanline HUD overlay */}
          <div aria-hidden className="absolute inset-0 chevron-bg-soft pointer-events-none" />
          <div aria-hidden className="absolute inset-0 scanline pointer-events-none" />

          {/* Top hairline + checker strip */}
          <span aria-hidden className="absolute top-0 left-0 right-0 h-[3px] bg-f1" />
          <div
            aria-hidden
            className="absolute top-[3px] left-0 right-0 h-[10px] checker-strip checker-strip-sm opacity-90"
          />

          <div className="relative pt-[24px] p-6 sm:p-8 md:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 md:gap-10 lg:gap-14">
            {/* LEFT */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="eyebrow-red">
                  Round {String(race.round).padStart(2, "0")} · Up Next
                </span>
                <span className="chip chip-dark">
                  <span className="pulse-dot inline-block w-[6px] h-[6px] rounded-full bg-f1" />
                  {code}
                </span>
                <ShiftLights className="ml-auto sm:ml-0" />
              </div>

              <Link
                href={`/races/${race.round}`}
                className="headline-link block mt-6 md:mt-8"
              >
                <h2 className="headline h-hero text-paper">
                  {head}
                  {tail && (
                    <>
                      {" "}
                      <em className="text-f1">{tail}</em>
                    </>
                  )}
                </h2>
              </Link>

              <div className="mt-8 md:mt-10 grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8 max-w-3xl">
                <Field label="Circuit" value={race.circuit} />
                <Field label="Country" value={race.country} />
                <Field
                  label="Round"
                  value={`${String(race.round).padStart(2, "0")} of ${String(totalRounds).padStart(2, "0")}`}
                  mono
                />
                <Field
                  label="Race Day"
                  value={formatRaceFullDate(race.race_date)}
                  mono
                />
              </div>

              <Link
                href={`/races/${race.round}`}
                className="mt-7 md:mt-8 inline-flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.2em] uppercase text-paper hover:text-f1 transition-colors border-b border-paper/30 hover:border-f1 pb-1"
              >
                View race detail <span aria-hidden>→</span>
              </Link>
            </div>

            {/* RIGHT — countdown */}
            <div className="lg:border-l lg:border-paper/15 lg:pl-10 flex lg:items-end pt-4 lg:pt-0">
              <Countdown targetISO={target} />
            </div>
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
      <span className="eyebrow text-paper/55">{label}</span>
      <span
        className={`text-paper text-[15px] md:text-[16px] leading-snug ${
          mono ? "font-mono tabular" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
