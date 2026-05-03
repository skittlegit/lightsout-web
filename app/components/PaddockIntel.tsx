import type { PaddockIntel } from "@/lib/types";
import { teamColor } from "@/lib/format";
import { SectionHead } from "./DriversTable";

interface Props {
  intel: PaddockIntel | null;
}

export default function PaddockIntelView({ intel }: Props) {
  return (
    <div className="flex flex-col">
      <SectionHead num="03" headHTML="Paddock" tail="Intel" />

      {!intel ? (
        <p className="mt-6 text-sm text-muted">
          No completed rounds yet — check back after the season opener.
        </p>
      ) : (
        <>
          <span className="eyebrow mt-6 block">
            Last Race · {intel.race_name}
          </span>
          <ul className="mt-3 flex flex-col">
            {intel.podium.map((r) => (
              <li
                key={r.position}
                className="relative grid grid-cols-[1.25rem_1fr_auto] gap-3 items-center py-2.5 border-b border-rule last:border-b-0"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-2 bottom-2 w-[3px]"
                  style={{ background: teamColor(r.team_id) }}
                />
                <span className="font-mono tabular text-[12px] text-muted pl-2">
                  P{r.position}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-[17px] leading-tight truncate">
                    {r.driver_name}
                  </div>
                  <div className="eyebrow mt-0.5 truncate">
                    {r.team} · {r.driver_code}
                  </div>
                </div>
                <span className="font-mono tabular text-[12px] text-ink">
                  {r.gap ?? ""}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <div className="flex flex-wrap gap-2 mb-3">
              {intel.tags.map((t) => (
                <span
                  key={t.label}
                  className="font-mono text-[10px] tracking-[0.16em] px-2 py-1 border border-ink text-ink"
                >
                  {t.label}
                </span>
              ))}
            </div>
            <span className="eyebrow-red block mb-2">The Story</span>
            <p className="font-display text-[19px] leading-snug italic text-ink-soft">
              {intel.story}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
