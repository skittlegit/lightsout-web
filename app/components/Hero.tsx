import Countdown from "./Countdown";
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
  const roundLabel = `Round ${String(race.round).padStart(2, "0")} · Up Next`;
  const code = countryCode(race.country);

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
                  {code}
                </span>
              </span>
            </div>

            <Link
              href={`/races/${race.round}`}
              className="block focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
            >
              <h2 className="headline text-paper mt-8 text-[14vw] md:text-[8.5rem] leading-[0.9] hover:text-paper/90 transition-colors">
                {head}
                {tail && (
                  <>
                    {" "}
                    <em className="text-f1">{tail}</em>
                  </>
                )}
              </h2>
            </Link>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10 max-w-3xl">
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
              className="mt-8 inline-flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.18em] uppercase text-paper/80 hover:text-f1 transition-colors focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2"
            >
              View race detail →
            </Link>
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
