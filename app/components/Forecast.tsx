import type {
  DriverPrediction,
  ModePrediction,
  PredictedPole,
  PredictionResponse,
  RaceWeather,
} from "@/lib/types";
import { pct, pctShort, raceStartISO, relativeTimeUpper, teamColor, teamShort } from "@/lib/format";
import LocalStartTime from "./LocalStartTime";
import PredictionHeatmap from "./PredictionHeatmap";

interface Props {
  data: PredictionResponse;
}

const BOARD_SIZE = 10;

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
          <div className="sm:text-right flex flex-col items-start sm:items-end gap-1.5">
            <span className="eyebrow">
              {data.race_name} · Round {String(data.round).padStart(2, "0")}
            </span>
            {data.race_time && data.race_date && (
              <span className="eyebrow-ink">
                Lights out · <LocalStartTime iso={raceStartISO(data.race_date, data.race_time)} />
              </span>
            )}
          </div>
        </div>
        <div className="rule-thin mt-6" />

        {isUnavailable || !mode ? (
          <EmptyState message={data.message ?? null} />
        ) : (
          <ForecastBody mode={mode} weather={data.weather ?? null} isPostQuali={!!data.post_quali} />
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
        The forecast is temporarily unavailable. Please check back shortly.
      </p>
      {message && (
        <p className="mt-3 text-sm text-muted max-w-xl">{message}</p>
      )}
      <p className="mt-3 text-sm text-muted max-w-xl">
        Forecasts refresh as new race and qualifying data becomes available.
      </p>
    </div>
  );
}

function ForecastBody({
  mode,
  weather,
  isPostQuali,
}: {
  mode: ModePrediction;
  weather: RaceWeather | null;
  isPostQuali: boolean;
}) {
  const pole = mode.predicted_pole;
  // "Predicted winner" is the most likely winner. Lowest expected position can
  // belong to a consistent top-4 runner with a single-digit win chance.
  const byWin = [...mode.drivers].sort((a, b) => b.win_probability - a.win_probability);
  const winner = byWin[0] ?? null;
  const board = byWin.slice(0, BOARD_SIZE);
  const winScale = board[0]?.win_probability || 1;

  const updatedRel = relativeTimeUpper(mode.generated_at);
  const stageLabel = isPostQuali ? "POST-QUALI" : "PRE-RACE";
  const simsK = `${Math.round(mode.n_simulations / 1000)}K`;

  return (
    <>
      <div className={`mt-9 md:mt-10 grid grid-cols-1 gap-5 ${weather ? "lg:grid-cols-3 md:grid-cols-2" : "md:grid-cols-2"}`}>
        {winner && (
          <Callout
            eyebrow="Predicted Winner"
            name={winner.driver_name}
            meta={`${teamShort(winner.team)} · ${winner.driver_code}`}
            color={teamColor(winner.team)}
            statLabel="Win probability"
            stat={pctShort(winner.win_probability)}
            accent
          />
        )}
        {pole && <PoleCallout pole={pole} />}
        {weather && <WeatherCallout weather={weather} />}
      </div>

      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="eyebrow-ink">Odds Board · Top {board.length} by Win Chance</span>
          <span className="eyebrow">{simsK} Simulated Races</span>
        </div>

        <div className="mt-4 hidden md:grid grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem] gap-4 pb-2 border-b border-ink">
          <span className="eyebrow">#</span>
          <span className="eyebrow">Driver</span>
          <span className="eyebrow">Win</span>
          <span className="eyebrow">Podium</span>
          <span className="eyebrow">Points</span>
          <span className="eyebrow text-right">Exp</span>
        </div>
        <ol className="flex flex-col">
          {board.map((d, i) => (
            <OddsRow key={d.driver_code} d={d} rank={i + 1} winScale={winScale} />
          ))}
        </ol>
      </div>

      <details className="mt-10 group">
        <summary className="cursor-pointer list-none flex items-center justify-between border-y border-ink py-3 select-none">
          <span className="eyebrow-ink">Full Distribution Matrix · {mode.drivers.length} × {mode.drivers[0]?.position_distribution.length ?? 0}</span>
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

function OddsRow({ d, rank, winScale }: { d: DriverPrediction; rank: number; winScale: number }) {
  const color = teamColor(d.team);
  return (
    <li className="row-hover relative grid grid-cols-[2rem_minmax(0,1fr)_auto] md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem] gap-x-4 gap-y-2 items-center py-3 border-b border-rule last:border-b-0">
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px]" style={{ background: color }} />
      <span className="font-mono tabular text-[12px] text-muted pl-3">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="font-display text-[18px] leading-tight truncate">{d.driver_name}</div>
        <div className="eyebrow mt-0.5 truncate">{teamShort(d.team)} · {d.driver_code}</div>
      </div>
      {/* Mobile: headline win % only; the meters need the wide grid. */}
      <span className="md:hidden font-mono tabular text-[15px]">{pct(d.win_probability)}</span>
      <div className="hidden md:contents">
        <Meter value={d.win_probability} scale={winScale} color={color} strong />
        <Meter value={d.podium_probability} scale={1} color={color} />
        <Meter value={d.points_probability} scale={1} color={color} />
        <span className="font-mono tabular text-[13px] text-right text-muted">
          P{d.expected_position.toFixed(1)}
        </span>
      </div>
    </li>
  );
}

/** Probability as a labelled bar; `scale` normalises bar width (win odds are small). */
function Meter({ value, scale, color, strong }: { value: number; scale: number; color: string; strong?: boolean }) {
  const width = Math.max(1.5, Math.min(1, value / scale) * 100);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-[6px] flex-1 bg-paper-deep overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${width}%`, background: color, opacity: strong ? 1 : 0.55 }}
        />
      </div>
      <span className={`font-mono tabular text-[12px] w-[3.25rem] text-right ${strong ? "text-ink" : "text-muted"}`}>
        {pct(value)}
      </span>
    </div>
  );
}

// .eyebrow's colour is unlayered CSS, so a text-* utility can't override it.
const INVERT_MUTED = { color: "color-mix(in srgb, var(--color-paper) 62%, transparent)" } as const;

function Callout({
  eyebrow,
  name,
  meta,
  color,
  statLabel,
  stat,
  accent,
}: {
  eyebrow: string;
  name: string;
  meta: string;
  color: string;
  statLabel: string;
  stat: string;
  accent?: boolean;
}) {
  return (
    // The accent variant skips .card: its unlayered paper background would
    // override the bg-ink utility and leave light text on a light card.
    <div className={`hover-lift p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden ${accent ? "surface-invert bg-ink text-paper border border-ink" : "card card-deep"}`}>
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color }} />
      {accent && <div aria-hidden className="absolute inset-0 chevron-bg-soft pointer-events-none" />}
      <span className="eyebrow-red relative">{eyebrow}</span>
      <div className="relative">
        <div className={`font-display text-[clamp(2rem,4.5vw,3rem)] leading-[0.95] ${accent ? "text-paper" : ""}`}>
          {name}
        </div>
        <div className="eyebrow mt-2" style={accent ? INVERT_MUTED : undefined}>{meta}</div>
      </div>
      <div className="relative flex items-baseline justify-between mt-auto pt-2">
        <span className="eyebrow" style={accent ? INVERT_MUTED : undefined}>{statLabel}</span>
        <span className="numeric-lg text-f1">{stat}</span>
      </div>
    </div>
  );
}

function PoleCallout({ pole }: { pole: PredictedPole }) {
  return (
    <Callout
      eyebrow="Predicted Pole"
      name={pole.driver_name}
      meta={`${teamShort(pole.team)} · ${pole.driver_code}`}
      color={teamColor(pole.team)}
      // The API's "confidence" is the pole-probability margin over P2.
      statLabel="Edge over P2"
      stat={`+${pctShort(pole.confidence)}`}
    />
  );
}

const WEATHER_SOURCE: Record<RaceWeather["source"], string> = {
  forecast: "Live forecast",
  observed: "Observed",
  climatology: "Circuit average",
};

function WeatherCallout({ weather }: { weather: RaceWeather }) {
  const rain = weather.rain_probability;
  const outlook = rain >= 0.6 ? "Wet race likely" : rain >= 0.3 ? "Mixed conditions" : "Dry race expected";
  return (
    <div className="card card-deep hover-lift p-6 md:p-8 flex flex-col gap-4 relative md:col-span-2 lg:col-span-1">
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-team-williams" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow-red">Race Conditions</span>
        <span className="eyebrow">{WEATHER_SOURCE[weather.source]}</span>
      </div>
      <div className="font-display italic text-[clamp(1.6rem,3.5vw,2.25rem)] leading-[1]">{outlook}</div>
      <div className="grid grid-cols-2 gap-4 mt-auto pt-2">
        <div>
          <span className="eyebrow block">Rain chance</span>
          <span className="numeric-lg">{pctShort(rain)}</span>
          <RainGauge value={rain} />
        </div>
        <div>
          <span className="eyebrow block">Air temp</span>
          <span className="numeric-lg">{Math.round(weather.temp_c)}°<span className="text-muted text-[18px]">C</span></span>
        </div>
      </div>
    </div>
  );
}

/** Ten-segment gauge — reads like a rain radar strip. */
function RainGauge({ value }: { value: number }) {
  const lit = Math.round(value * 10);
  return (
    <div aria-hidden className="mt-2 flex gap-[3px]">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className="h-[6px] flex-1"
          style={{ background: i < lit ? "var(--color-team-williams)" : "var(--color-paper-deeper)" }}
        />
      ))}
    </div>
  );
}
