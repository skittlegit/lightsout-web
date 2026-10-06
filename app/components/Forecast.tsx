import type {
  DriverPrediction,
  ModePrediction,
  PredictedPole,
  PredictionResponse,
  RaceWeather,
} from "@/lib/types";
import { pct, pctShort, relativeTimeUpper, teamColor, teamShort } from "@/lib/format";
import PredictionHeatmap from "./PredictionHeatmap";
import SectionTitle from "./SectionTitle";
import { CardHead } from "./ui";
import DriverName from "./DriverName";

const BOARD_SIZE = 10;

/** Race-page section: title + the full forecast panel. */
export default function Forecast({ data }: { data: PredictionResponse }) {
  return (
    <section id="forecast" className="section-y">
      <div className="container-max">
        <SectionTitle kicker="Model forecast" title="Race forecast" />
        <div className="mt-6">
          <ForecastPanel data={data} />
        </div>
      </div>
    </section>
  );
}

/** Best available mode: post-quali once qualifying has run, else pre-race. */
function activeMode(data: PredictionResponse): ModePrediction | null {
  return data.status === "model_unavailable" ? null : (data.post_quali ?? data.pre_quali);
}

/** Most likely winner — not the lowest expected position, which can belong
 * to a consistent top-4 runner with a single-digit win chance. */
function byWinChance(mode: ModePrediction): DriverPrediction[] {
  return [...mode.drivers].sort((a, b) => b.win_probability - a.win_probability);
}

/** Full forecast: headline cards, odds board, distribution matrix. */
export function ForecastPanel({ data }: { data: PredictionResponse }) {
  const mode = activeMode(data);
  if (!mode) return <EmptyState message={data.message ?? null} />;

  const ranked = byWinChance(mode);
  const winner = ranked[0] ?? null;
  const board = ranked.slice(0, BOARD_SIZE);
  const winScale = board[0]?.win_probability || 1;
  const simsK = `${Math.round(mode.n_simulations / 1000)}K`;
  const weather = data.weather ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className={`grid grid-cols-1 gap-5 ${weather ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {winner && <WinnerCallout winner={winner} />}
        {mode.predicted_pole && <PoleCallout pole={mode.predicted_pole} />}
        {weather && <WeatherCallout weather={weather} />}
      </div>

      <div className="card overflow-hidden">
        <CardHead title="Odds board" meta={`Top ${board.length} by win chance`} />
        <div className="hidden md:grid grid-cols-[28px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem] gap-4 px-5 py-2.5 border-b border-rule">
          <span className="eyebrow">#</span>
          <span className="eyebrow">Driver</span>
          <span className="eyebrow">Win</span>
          <span className="eyebrow">Podium</span>
          <span className="eyebrow">Points</span>
          <span className="eyebrow text-right">Avg pos</span>
        </div>
        <ol className="flex flex-col">
          {board.map((d, i) => (
            <OddsRow key={d.driver_code} d={d} rank={i + 1} winScale={winScale} />
          ))}
        </ol>

        <details className="group border-t border-rule">
          <summary className="cursor-pointer list-none flex items-center justify-between px-5 h-12 select-none row-hover">
            <span className="text-[14px] font-medium">
              Every driver, every position · {mode.drivers.length} × {mode.drivers[0]?.position_distribution.length ?? 0}
            </span>
            <span className="text-[13px] text-muted group-open:hidden">Show</span>
            <span className="text-[13px] text-muted hidden group-open:inline">Hide</span>
          </summary>
          <div className="px-5 pb-6 pt-2">
            <PredictionHeatmap drivers={mode.drivers} />
            <p className="mt-4 text-[12px] text-muted max-w-2xl leading-relaxed">
              Each cell is the chance (%) of that finishing position. Cells under 5% are blank.
            </p>
          </div>
        </details>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="chip">{data.post_quali ? "After qualifying" : "Before qualifying"}</span>
        <span className="chip">{simsK} simulated races</span>
        <span className="chip">Model {mode.model_version}</span>
        <span className="chip">Updated {relativeTimeUpper(mode.generated_at).toLowerCase()}</span>
      </div>
    </div>
  );
}

/** Home-page spotlight: the three favourites, pole pick and conditions. */
export function ForecastSpotlight({ data }: { data: PredictionResponse }) {
  const mode = activeMode(data);
  if (!mode) return <EmptyState message={data.message ?? null} />;
  const favourites = byWinChance(mode).slice(0, 3);
  const scale = favourites[0]?.win_probability || 1;
  const pole = mode.predicted_pole;
  const weather = data.weather ?? null;

  return (
    <div className="card overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <ol className="flex flex-col">
        {favourites.map((d, i) => (
          <li key={d.driver_code} className="flex items-center gap-4 px-5 sm:px-6 py-5 border-b border-rule last:border-b-0">
            <span className={`pos-badge ${i === 0 ? "pos-badge--lead" : ""}`}>{i + 1}</span>
            <span aria-hidden className="team-pip !h-10" style={{ background: teamColor(d.team) }} />
            <div className="min-w-0 flex-1">
              <DriverName name={d.driver_name} className="block text-[17px] truncate" />
              <div className="mt-2 h-[6px] rounded-full bg-paper-deeper overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.max(2, (d.win_probability / scale) * 100)}%`, background: teamColor(d.team) }} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-[28px] font-extrabold leading-none tabular">{pct(d.win_probability)}</div>
              <div className="eyebrow mt-1">to win</div>
            </div>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-3 lg:grid-cols-1 border-t lg:border-t-0 lg:border-l border-rule">
        <SpotlightStat label="Pole pick" value={pole ? <DriverName name={pole.driver_name} /> : "—"} />
        <SpotlightStat label="Rain chance" value={weather ? pctShort(weather.rain_probability) : "—"} />
        <SpotlightStat label="Air temp" value={weather ? `${Math.round(weather.temp_c)}°C` : "—"} />
      </dl>
    </div>
  );
}

function SpotlightStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-5 sm:px-6 py-4 border-r lg:border-r-0 lg:border-b border-rule last:border-0 min-w-0 flex flex-col justify-center">
      <dt className="eyebrow">{label}</dt>
      <dd className="font-display text-[18px] sm:text-[20px] font-bold mt-1 truncate">{value}</dd>
    </div>
  );
}

function EmptyState({ message }: { message: string | null }) {
  return (
    <div className="card p-7 md:p-10">
      <h3 className="font-display text-xl font-semibold">Forecast temporarily unavailable</h3>
      <p className="mt-2 text-sm text-muted max-w-xl">
        {message ?? "Please check back shortly."} Forecasts refresh as new race and qualifying data arrives.
      </p>
    </div>
  );
}

function OddsRow({ d, rank, winScale }: { d: DriverPrediction; rank: number; winScale: number }) {
  const color = teamColor(d.team);
  return (
    <li className="row-hover grid grid-cols-[28px_minmax(0,1fr)_auto] md:grid-cols-[28px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem] gap-x-4 items-center px-4 sm:px-5 py-2.5 border-b border-rule last:border-b-0">
      <span className={`pos-badge ${rank === 1 ? "pos-badge--lead" : ""}`}>{rank}</span>
      <div className="min-w-0 flex items-center gap-3">
        <span aria-hidden className="team-pip" style={{ background: color }} />
        <div className="min-w-0">
          <DriverName name={d.driver_name} className="block text-[15px] leading-tight truncate" />
          <div className="text-[12.5px] text-muted truncate">{teamShort(d.team)}</div>
        </div>
      </div>
      {/* Mobile: headline win % only; the meters need the wide grid. */}
      <span className="md:hidden font-mono tabular text-[14.5px] font-semibold">{pct(d.win_probability)}</span>
      <div className="hidden md:contents">
        <Meter value={d.win_probability} scale={winScale} color={color} strong />
        <Meter value={d.podium_probability} scale={1} color={color} />
        <Meter value={d.points_probability} scale={1} color={color} />
        <span className="font-mono tabular text-[13px] text-right text-muted">{d.expected_position.toFixed(1)}</span>
      </div>
    </li>
  );
}

/** Probability as a labelled bar; `scale` normalises bar width (win odds are small). */
function Meter({ value, scale, color, strong }: { value: number; scale: number; color: string; strong?: boolean }) {
  const width = Math.max(1.5, Math.min(1, value / scale) * 100);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-[6px] flex-1 rounded-full bg-paper-deeper overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color, opacity: strong ? 1 : 0.5 }} />
      </div>
      <span className={`font-mono tabular text-[12.5px] w-[3.25rem] text-right ${strong ? "text-ink font-semibold" : "text-muted"}`}>
        {pct(value)}
      </span>
    </div>
  );
}

function Callout({
  label,
  aside,
  color,
  carbon,
  className = "",
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  color?: string;
  carbon?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${carbon ? "panel-carbon" : "card"} relative overflow-hidden p-6 flex flex-col gap-4 min-h-[200px] ${className}`}>
      {color && <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full" style={{ background: color }} />}
      <div className="flex items-center justify-between gap-3">
        <span className="kicker">{label}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

function CalloutName({ name, meta }: { name: string; meta: string }) {
  return (
    <div>
      <div className="font-display text-[clamp(1.5rem,2.6vw,1.9rem)] font-bold leading-tight tracking-[-0.03em]">{name}</div>
      <div className="text-[13px] text-muted mt-1">{meta}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mt-auto flex items-end justify-between gap-3 pt-4 border-t border-rule">
      <span className="eyebrow">{label}</span>
      <span className={`numeric-lg ${accent ? "text-f1-soft" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function WinnerCallout({ winner }: { winner: DriverPrediction }) {
  return (
    <Callout label="Predicted winner" color={teamColor(winner.team)} carbon>
      <CalloutName name={winner.driver_name} meta={`${teamShort(winner.team)} · ${winner.driver_code}`} />
      <Stat label="Win probability" value={pctShort(winner.win_probability)} accent />
    </Callout>
  );
}

function PoleCallout({ pole }: { pole: PredictedPole }) {
  return (
    <Callout label="Predicted pole" color={teamColor(pole.team)}>
      <CalloutName name={pole.driver_name} meta={`${teamShort(pole.team)} · ${pole.driver_code}`} />
      {/* The API's "confidence" is the pole-probability margin over P2. */}
      <Stat label="Edge over P2" value={`+${pctShort(pole.confidence)}`} />
    </Callout>
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
    <Callout
      label="Conditions"
      aside={<span className="chip">{WEATHER_SOURCE[weather.source]}</span>}
      color="var(--color-team-williams)"
      className="md:col-span-2 lg:col-span-1"
    >
      <div className="font-display text-[clamp(1.4rem,2.4vw,1.75rem)] font-bold leading-tight tracking-[-0.03em]">{outlook}</div>
      <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-rule">
        <div>
          <span className="eyebrow block">Rain chance</span>
          <span className="numeric-lg block mt-1.5">{pctShort(rain)}</span>
          <div aria-hidden className="mt-2.5 h-[6px] rounded-full bg-paper-deeper overflow-hidden">
            <div className="h-full rounded-full bg-team-williams" style={{ width: `${Math.max(2, rain * 100)}%` }} />
          </div>
        </div>
        <div>
          <span className="eyebrow block">Air temp</span>
          <span className="numeric-lg block mt-1.5">{Math.round(weather.temp_c)}°C</span>
        </div>
      </div>
    </Callout>
  );
}
