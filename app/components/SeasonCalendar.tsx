import type { Race } from "@/lib/types";
import { formatRaceDate } from "@/lib/format";

interface Props {
  rounds: Race[];
  nextRound: number | null | undefined;
  season: number;
}

export default function SeasonCalendar({ rounds, nextRound, season }: Props) {
  return (
    <section id="calendar" className="px-6 md:px-10 py-14 md:py-20">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeading
          eyebrow={`${season} SEASON · ${rounds.length} ROUNDS`}
          headHTML="Season"
          tail="Calendar"
        />

        <div className="mt-10 -mx-6 md:-mx-10">
          <div className="overflow-x-auto no-scrollbar px-6 md:px-10">
            <ul className="flex gap-3 min-w-max">
              {rounds.map((r) => (
                <CalendarCard
                  key={r.round}
                  race={r}
                  isNext={r.round === nextRound || r.status === "next"}
                />
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

function CalendarCard({ race, isNext }: { race: Race; isNext: boolean }) {
  const completed = race.status === "completed" && !isNext;
  const dateRange = formatRaceDate(race.start_date, race.race_date);

  // Variant styles
  const base =
    "shrink-0 w-[170px] md:w-[200px] aspect-[4/5] flex flex-col justify-between p-4 transition-opacity duration-300";
  let variant = "bg-paper border border-rule";
  if (isNext) variant = "bg-ink text-paper";
  else if (completed) variant = "bg-paper border border-rule opacity-50";

  return (
    <li className={`${base} ${variant}`}>
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
          {race.country_code}
        </span>
        <span
          className={`font-display italic text-2xl leading-tight ${
            isNext ? "text-paper" : "text-ink"
          }`}
        >
          {race.locality}
        </span>
        <span
          className={`font-mono tabular text-[10px] tracking-[0.12em] mt-2 uppercase ${
            isNext ? "text-paper/60" : "text-muted"
          }`}
        >
          {dateRange}
        </span>
      </div>
    </li>
  );
}
