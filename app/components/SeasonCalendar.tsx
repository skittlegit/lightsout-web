import type { Race } from "@/lib/types";
import CalendarBoard from "./CalendarBoard";

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

        <div className="mt-8 md:mt-10">
          <CalendarBoard races={races} season={season} />
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
