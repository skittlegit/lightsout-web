import type { Race } from "@/lib/types";
import { formatRaceDate, countryCode } from "@/lib/format";
import Link from "next/link";

interface Props {
  races: Race[];
  season: number;
}

export default function SeasonCalendar({ races, season }: Props) {
  const completed = races.filter((r) => r.is_completed).length;

  return (
    <section id="calendar" className="section-y">
      <div className="container-max">
        <SectionHeading
          eyebrow={`${season} Season · ${races.length} rounds · ${completed} done`}
          headHTML="Season"
          tail="Calendar"
        />

        <div className="mt-8 md:mt-10 -mx-[var(--gutter-x)] relative">
          <div
            className="overflow-x-auto no-scrollbar fade-x-edges scroll-snap-x px-[var(--gutter-x)] pb-2"
            role="list"
            aria-label={`${season} season rounds`}
          >
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
        <h3 className="headline h-section">
          {headHTML} <em>{tail}</em>
        </h3>
      </div>
      <span className="eyebrow text-right uppercase">{eyebrow}</span>
    </div>
  );
}

function CalendarCard({ race }: { race: Race }) {
  const { is_next: isNext, is_completed: completed } = race;
  const code = countryCode(race.country);

  const base =
    "shrink-0 w-[160px] sm:w-[180px] md:w-[200px] aspect-[4/5] flex flex-col justify-between p-4 transition-all duration-200 hover-lift";

  let variant = "bg-paper border border-rule hover:border-ink";
  if (isNext) variant = "bg-ink text-paper border border-ink";
  else if (completed)
    variant =
      "bg-paper-deep border border-rule text-muted hover:text-ink hover:border-rule-strong";

  return (
    <li role="listitem">
      <Link
        href={`/races/${race.round}`}
        className={`${base} ${variant}`}
        aria-label={`${race.race_name}, round ${race.round}, ${formatRaceDate(race.race_date)}${isNext ? " · next race" : completed ? " · completed" : ""}`}
      >
        <div className="flex items-start justify-between">
          <span
            className={`font-mono text-[10px] tracking-[0.16em] ${
              isNext ? "text-paper/70" : completed ? "text-muted-soft" : "text-muted"
            }`}
          >
            R{String(race.round).padStart(2, "0")}
          </span>
          {isNext && (
            <span className="pulse-dot inline-block w-[8px] h-[8px] rounded-full bg-f1" />
          )}
          {completed && !isNext && (
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted-soft uppercase">
              Done
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span
            className={`font-mono tabular text-[11px] tracking-[0.18em] ${
              isNext ? "text-f1" : completed ? "text-muted-soft" : "text-ink"
            }`}
          >
            {code}
          </span>
          <span
            className={`font-display italic text-2xl leading-tight ${
              isNext ? "text-paper" : completed ? "text-ink/70" : "text-ink"
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
