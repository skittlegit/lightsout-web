import type { Race } from "@/lib/types";
import { formatRaceDate, countryCode } from "@/lib/format";
import Link from "next/link";

interface Props {
  races: Race[];
  season: number;
}

export default function SeasonCalendar({ races, season }: Props) {
  return (
    <section id="calendar" className="px-6 md:px-10 py-14 md:py-20">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeading
          eyebrow={`${season} SEASON · ${races.length} ROUNDS`}
          headHTML="Season"
          tail="Calendar"
        />

        <div className="mt-10 -mx-6 md:-mx-10">
          <div className="overflow-x-auto no-scrollbar px-6 md:px-10">
            <ul className="flex gap-3 min-w-max">
              {races.map((r) => (
                <CalendarCard key={r.round} race={r} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  headHTML,
  tail,
  prefix,
}: {
  eyebrow: string;
  headHTML: string;
  tail: string;
  prefix?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div>
        {prefix && <span className="eyebrow-red block mb-2">§ {prefix}</span>}
        <h3 className="headline text-[12vw] md:text-[5rem] leading-[0.95]">
          {headHTML} <em>{tail}</em>
        </h3>
      </div>
      <span className="eyebrow text-right">{eyebrow}</span>
    </div>
  );
}

function CalendarCard({ race }: { race: Race }) {
  const { is_next: isNext, is_completed: completed } = race;
  const code = countryCode(race.country);

  const base =
    "shrink-0 w-[170px] md:w-[200px] aspect-[4/5] flex flex-col justify-between p-4 transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-f1 focus-visible:outline-offset-2";
  let variant = "bg-paper border border-rule hover:border-ink";
  if (isNext) variant = "bg-ink text-paper";
  else if (completed) variant = "bg-paper border border-rule opacity-50 hover:opacity-80";

  return (
    <li>
      <Link href={`/races/${race.round}`} className={`${base} ${variant}`}>
        <div className="flex items-start justify-between">
          <span
            className={`font-mono text-[10px] tracking-[0.16em] ${
              isNext ? "text-paper/70" : "text-muted"
            }`}
          >
            R{String(race.round).padStart(2, "0")}
          </span>
          {isNext && (
            <span className="pulse-dot inline-block w-[8px] h-[8px] rounded-full bg-f1" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span
            className={`font-mono tabular text-[11px] tracking-[0.18em] ${
              isNext ? "text-f1" : completed ? "text-muted" : "text-ink"
            }`}
          >
            {code}
          </span>
          <span
            className={`font-display italic text-2xl leading-tight ${
              isNext ? "text-paper" : "text-ink"
            }`}
          >
            {race.country}
          </span>
          <span
            className={`font-mono tabular text-[10px] tracking-[0.12em] mt-2 uppercase ${
              isNext ? "text-paper/60" : "text-muted"
            }`}
          >
            {formatRaceDate(race.race_date)}
          </span>
        </div>
      </Link>
    </li>
  );
}
