import type {
  DriverPrediction,
  ModePrediction,
  PredictedPole,
  PredictionResponse,
} from "@/lib/types";
import { pct, pctShort, relativeTimeUpper, teamColor, teamShort } from "@/lib/format";
import PredictionHeatmap from "./PredictionHeatmap";

interface Props {
  data: PredictionResponse;
}

export default function Forecast({ data }: Props) {
  const isUnavailable = data.status === "model_unavailable";
  const mode: ModePrediction | null = data.post_quali ?? data.pre_quali;

  return (
    <section id="forecast" className="section-y">
      <div className="container-max">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <span className="eyebrow-red block mb-2">§ 04</span>
            <h3 className="headline h-section">
              Race <em>Forecast</em>
            </h3>
          </div>
          <span className="eyebrow text-right max-w-xs">
            {data.race_name} · Round {String(data.round).padStart(2, "0")}
          </span>
        </div>
        <div className="rule-thin mt-6" />

        {isUnavailable || !mode ? (
          <EmptyState message={data.message ?? null} />
        ) : (
          <ForecastBody mode={mode} isPostQuali={!!data.post_quali} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string | null }) {
  return (
    <div className="mt-10 card card-deep p-7 md:p-12">
      <span className="eyebrow-red block">Forecast Unavailable</span>
      <p className="mt-3 font-display italic text-[clamp(1.25rem,3vw,1.7rem)] text-ink-soft max-w-2xl leading-snug">
        The prediction model has not been trained for the next round yet.
      </p>
      {message && (
        <p className="mt-3 text-sm text-muted max-w-xl">{message}</p>
      )}
      <p className="mt-3 text-sm text-muted max-w-xl">
        Forecasts return when the lightsout-api{" "}
        <code className="font-mono text-[12px] bg-paper-deep px-1.5 py-0.5">
          /predictions/next
        </code>{" "}
        endpoint publishes a model version for this race.
      </p>
    </div>
  );
}

function ForecastBody({
  mode,
  isPostQuali,
}: {
  mode: ModePrediction;
  isPostQuali: boolean;
}) {
  const pole = mode.predicted_pole;
  const winner =
    [...mode.drivers].sort((a, b) => a.expected_position - b.expected_position)[0] ?? null;

  const top5 = [...mode.drivers]
    .sort((a, b) => b.win_probability - a.win_probability)
    .slice(0, 5);
  const barLeader = top5[0]?.win_probability ?? 1;

  const updatedRel = relativeTimeUpper(mode.generated_at);
  const stageLabel = isPostQuali ? "POST-QUALI" : "PRE-RACE";
  const simsK = `${Math.round(mode.n_simulations / 1000)}K`;

  return (
    <>
      <div className="mt-9 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {pole && <PoleCallout pole={pole} />}
        {winner && <WinnerCallout winner={winner} />}
      </div>

      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="eyebrow-ink">Top 5 · Win Probability</span>
          <span className="eyebrow">{simsK} Sims</span>
        </div>
        <ul className="mt-4 flex flex-col">
          {top5.map((d, i) => {
            const w = barLeader > 0 ? d.win_probability / barLeader : 0;
            const color = teamColor(d.team);
            return (
              <li
                key={d.driver_code}
                className="row-hover relative grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-3 items-center py-3 border-b border-rule last:border-b-0"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-3 bottom-3 w-[3px]"
                  style={{ background: color }}
                />
                <span className="font-mono tabular text-[12px] text-muted pl-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-[19px] leading-tight truncate">
                    {d.driver_name}
                  </div>
                  <div className="eyebrow mt-0.5 truncate">
                    {teamShort(d.team)} · EXP P{d.expected_position.toFixed(1)}
                  </div>
                  <div className="mt-2 h-[4px] bg-paper-deep w-full max-w-[420px]">
                    <div
                      className="h-full transition-[width] duration-700"
                      style={{ width: `${Math.max(2, w * 100)}%`, background: color }}
                    />
                  </div>
                </div>
                <span className="font-mono tabular text-[15px] text-ink shrink-0">
                  {pct(d.win_probability)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <details className="mt-10 group">
        <summary className="cursor-pointer list-none flex items-center justify-between border-y border-ink py-3 select-none">
          <span className="eyebrow-ink">Full Distribution Matrix · 20 × 20</span>
          <span className="eyebrow group-open:hidden">Expand +</span>
          <span className="eyebrow hidden group-open:inline">Collapse −</span>
        </summary>
        <div className="pt-6">
          <PredictionHeatmap drivers={mode.drivers} />
          <p className="mt-4 text-[11px] text-muted max-w-2xl leading-relaxed">
            Cell value = round(P × 100). Cells below 5% are blank; colour scale
            is gamma-corrected so sub-threshold tails still register.
          </p>
        </div>
      </details>

      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-1">
        <span className="eyebrow">{stageLabel}</span>
        <span className="eyebrow">· {simsK} SIMS</span>
        <span className="eyebrow">· MODEL {mode.model_version.toUpperCase()}</span>
        <span className="eyebrow">· UPDATED {updatedRel}</span>
      </div>
    </>
  );
}

function PoleCallout({ pole }: { pole: PredictedPole }) {
  return (
    <div className="card hover-lift card-deep p-6 md:p-8 flex flex-col gap-4 relative">
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: teamColor(pole.team) }}
      />
      <span className="eyebrow-red">Predicted Pole</span>
      <div>
        <div className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-[0.95]">
          {pole.driver_name}
        </div>
        <div className="eyebrow mt-2">
          {teamShort(pole.team)} · {pole.driver_code}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <span className="eyebrow">Confidence</span>
        <span className="numeric-lg text-f1">
          {pctShort(pole.confidence)}
        </span>
      </div>
    </div>
  );
}

function WinnerCallout({ winner }: { winner: DriverPrediction }) {
  return (
    <div className="card hover-lift card-deep p-6 md:p-8 flex flex-col gap-4 relative">
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: teamColor(winner.team) }}
      />
      <span className="eyebrow-red">Predicted Winner</span>
      <div>
        <div className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-[0.95]">
          {winner.driver_name}
        </div>
        <div className="eyebrow mt-2">
          {teamShort(winner.team)} · {winner.driver_code}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <span className="eyebrow">Win Probability</span>
        <span className="numeric-lg text-f1">
          {pctShort(winner.win_probability)}
        </span>
      </div>
    </div>
  );
}
