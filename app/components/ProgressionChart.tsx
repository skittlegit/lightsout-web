import type { Progression } from "@/lib/season";
import { teamColor } from "@/lib/format";

const W = 860;
const H = 340;
const PAD = { top: 16, right: 64, bottom: 30, left: 44 };
const LABEL_GAP = 15;

/** Round to a readable gridline step (25, 50, 100, …). */
function niceStep(max: number): number {
  const raw = max / 5;
  const pow = 10 ** Math.floor(Math.log10(Math.max(1, raw)));
  return ([1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw);
}

/**
 * Cumulative championship points by round for the top drivers. Teammates
 * share a team colour, so the second driver of a team is drawn dashed.
 */
export default function ProgressionChart({ data }: { data: Progression }) {
  const { rounds, series } = data;
  if (rounds.length < 2 || !series.length) {
    return <p className="text-sm text-muted">The chart appears once two rounds are complete.</p>;
  }

  const max = Math.max(...series.flatMap((s) => s.points));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => PAD.left + (i / (rounds.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / top) * (H - PAD.top - PAD.bottom);

  const seenTeams = new Set<string>();
  const lines = series.map((s) => {
    const dashed = seenTeams.has(s.team);
    seenTeams.add(s.team);
    return { ...s, color: teamColor(s.team), dashed, endY: y(s.points.at(-1) ?? 0) };
  });

  // Spread end labels so close totals don't overlap.
  const labels = [...lines].sort((a, b) => a.endY - b.endY);
  for (let i = 1; i < labels.length; i++) {
    labels[i].endY = Math.max(labels[i].endY, labels[i - 1].endY + LABEL_GAP);
  }

  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const leader = series[0];

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Championship points after each round. ${leader.name} leads with ${leader.points.at(-1)} points.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-rule)" strokeWidth="1" />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-mono)">
              {t}
            </text>
          </g>
        ))}
        {rounds.map((r, i) =>
          i % Math.ceil(rounds.length / 12) === 0 || i === rounds.length - 1 ? (
            <text key={r} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-mono)">
              R{r}
            </text>
          ) : null,
        )}
        {lines.map((s) => (
          <polyline
            key={s.code}
            points={s.points.map((p, i) => `${x(i)},${y(p)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2.25"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={s.dashed ? "6 5" : undefined}
          />
        ))}
        {labels.map((s) => (
          <g key={s.code}>
            <circle cx={x(rounds.length - 1)} cy={y(s.points.at(-1) ?? 0)} r="3.5" fill={s.color} />
            <text x={W - PAD.right + 10} y={s.endY + 4} fontSize="12" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)">
              {s.code}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {lines.map((s) => (
          <span key={s.code} className="inline-flex items-center gap-2 text-[13px] text-muted">
            <svg width="18" height="4" aria-hidden>
              <line x1="0" x2="18" y1="2" y2="2" stroke={s.color} strokeWidth="3" strokeDasharray={s.dashed ? "4 3" : undefined} />
            </svg>
            <span className="text-ink">{s.name}</span>
            <span className="font-mono">{s.points.at(-1)}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
