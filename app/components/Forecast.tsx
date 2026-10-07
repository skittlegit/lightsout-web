import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import type {
  DriverPrediction,
  ModePrediction,
  PredictedPole,
  PredictionResponse,
  RaceWeather,
} from "@/lib/types";
import { pct, pctShort, teamColor, teamShort } from "@/lib/format";
import PredictionHeatmap from "./PredictionHeatmap";
import SectionTitle from "./SectionTitle";
import DriverName from "./DriverName";
import { CardHead, TableCard } from "./ui";

/** Race-page section: title + the full forecast panel. */
export default function Forecast({ data }: { data: PredictionResponse }) {
  return (
    <section id="forecast" className="section-y">
      <div className="container-max">
        <SectionTitle kicker="Model forecast" title="Race forecast" action={{ href: "/forecast", label: "Forecast page" }} />
        <div className="mt-6">
          <ForecastPanel data={data} />
        </div>
      </div>
    </section>
  );
}

/** Best available mode: post-quali once qualifying has run, else pre-race. */
export function activeMode(data: PredictionResponse): ModePrediction | null {
  return data.status === "model_unavailable" ? null : (data.post_quali ?? data.pre_quali);
}

/** Most likely winner first — not lowest expected position, which can belong
 * to a consistent top-4 runner with a single-digit win chance. */
function byWinChance(mode: ModePrediction): DriverPrediction[] {
  return [...mode.drivers].sort((a, b) => b.win_probability - a.win_probability);
}

const WEATHER_SOURCE: Record<RaceWeather["source"], string> = {
  forecast: "Live weather forecast",
  observed: "Observed weather",
  climatology: "Circuit average",
};

export function weatherOutlook(rain: number): string {
  return rain >= 0.6 ? "Wet race likely" : rain >= 0.3 ? "Mixed conditions" : "Dry race expected";
}

/* ================================================================== */
/* Full panel: /forecast page and upcoming race pages                 */
/* ================================================================== */

export function ForecastPanel({ data }: { data: PredictionResponse }) {
  const mode = activeMode(data);
  if (!mode) return <EmptyState message={data.message ?? null} />;

  const ranked = byWinChance(mode);
  const order = [...mode.drivers].sort((a, b) => a.expected_position - b.expected_position);

  return (
    <div className="flex flex-col gap-10">
      {/* Favourites */}
      <div>
        <SubHead title="Podium favourites" note="Most likely winners, from 10,000 simulated races" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {ranked.slice(0, 3).map((d, i) => (
            <FavouriteCard key={d.driver_code} d={d} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Win chances + pole + conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-4">
        <WinChart drivers={ranked.slice(0, 10)} />
        <div className="flex flex-col gap-4">
          {mode.predicted_pole && <PoleCard pole={mode.predicted_pole} />}
          {data.weather && <WeatherCard weather={data.weather} />}
        </div>
      </div>

      {/* Predicted order */}
      <div>
        <SubHead title="Predicted order" note="Every driver, ranked by average simulated finish" />
        <div className="mt-4">
          <TableCard minWidth={720}>
            <thead>
              <tr>
                <th className="w-14">Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th className="num">Win</th>
                <th className="num">Podium</th>
                <th className="num">Points</th>
                <th className="num">Avg finish</th>
              </tr>
            </thead>
            <tbody>
              {order.map((d, i) => (
                <tr key={d.driver_code}>
                  <td><span className={`pos-badge ${i === 0 ? "pos-badge--lead" : ""}`}>{i + 1}</span></td>
                  <td>
                    <Link href={`/drivers/${d.driver_code.toLowerCase()}` as Route} className="flex items-center gap-3 hover:text-f1 transition-colors">
                      <span aria-hidden className="team-pip" style={{ background: teamColor(d.team) }} />
                      <DriverName name={d.driver_name} />
                    </Link>
                  </td>
                  <td className="text-muted">{teamShort(d.team)}</td>
                  <td className="num font-semibold">{pct(d.win_probability)}</td>
                  <td className="num">{pct(d.podium_probability)}</td>
                  <td className="num">{pct(d.points_probability)}</td>
                  <td className="num text-muted">{d.expected_position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        </div>
      </div>

      {/* Position matrix */}
      <div>
        <SubHead
          title="Finishing position chances"
          note={`Chance (%) of each driver finishing in each position · ${mode.drivers.length} drivers`}
        />
        <div className="mt-4 card p-4 sm:p-5">
          <PredictionHeatmap drivers={mode.drivers} />
          <p className="mt-3 text-[13px] text-muted">Cells under 5% are left blank; darker red means more likely.</p>
        </div>
      </div>
    </div>
  );
}

function SubHead({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-x-6 gap-y-1 flex-wrap">
      <h3 className="font-display text-[20px]">{title}</h3>
      {note && <span className="text-[13.5px] text-muted">{note}</span>}
    </div>
  );
}

function FavouriteCard({ d, rank }: { d: DriverPrediction; rank: number }) {
  return (
    <Link
      href={`/drivers/${d.driver_code.toLowerCase()}` as Route}
      className="team-card p-6 flex flex-col gap-6 min-h-[220px]"
      style={{ "--team": teamColor(d.team) } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">
          {rank === 1 ? "Favourite" : `Contender ${rank}`}
        </span>
        <span className="text-right">
          <span className="block font-display text-[clamp(2rem,3.4vw,2.6rem)] leading-none tabular">
            {pctShort(d.win_probability)}
          </span>
          <span className="block eyebrow mt-1">to win</span>
        </span>
      </div>
      <div className="mt-auto">
        <DriverName name={d.driver_name} className="block text-[clamp(1.1rem,1.8vw,1.35rem)] [&_.surname]:font-extrabold" />
        <div className="text-[13px] text-white/75 mt-1">{teamShort(d.team)}</div>
        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-white/15 pt-4">
          <MiniStat label="Podium" value={pctShort(d.podium_probability)} />
          <MiniStat label="Avg finish" value={`P${d.expected_position.toFixed(1)}`} />
        </dl>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="font-display text-[18px] tabular mt-0.5">{value}</dd>
    </div>
  );
}

/** Horizontal bar chart of win probability, scaled to the favourite. */
function WinChart({ drivers }: { drivers: DriverPrediction[] }) {
  const max = drivers[0]?.win_probability || 1;
  return (
    <div className="card overflow-hidden">
      <CardHead title="Win probability" meta={`Top ${drivers.length}`} />
      <ol className="px-4 sm:px-5 py-3 flex flex-col gap-1">
        {drivers.map((d) => (
          <li key={d.driver_code} className="grid grid-cols-[3.25rem_minmax(0,1fr)_3.75rem] items-center gap-3 py-1.5">
            <span className="font-display text-[14px]">{d.driver_code}</span>
            <span className="h-[22px] rounded-md bg-paper-deeper overflow-hidden" aria-hidden>
              <span
                className="block h-full rounded-md"
                style={{ width: `${Math.max(2, (d.win_probability / max) * 100)}%`, background: teamColor(d.team) }}
              />
            </span>
            <span className="font-display text-[14px] text-right tabular">{pct(d.win_probability)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PoleCard({ pole }: { pole: PredictedPole }) {
  return (
    <div className="card p-5 sm:p-6 flex-1 flex flex-col">
      <span className="eyebrow">Predicted pole</span>
      <div className="mt-3 flex items-center gap-3">
        <span aria-hidden className="team-pip !h-10" style={{ background: teamColor(pole.team) }} />
        <div className="min-w-0">
          <DriverName name={pole.driver_name} className="block text-[19px] truncate" />
          <div className="text-[13px] text-muted">{teamShort(pole.team)}</div>
        </div>
      </div>
      {/* The API's "confidence" is the pole-probability margin over P2. */}
      <p className="mt-auto pt-4 text-[13.5px] text-muted">
        <span className="font-display text-ink text-[16px]">+{pctShort(pole.confidence)}</span> ahead of the
        next most likely pole-sitter
      </p>
    </div>
  );
}

function WeatherCard({ weather }: { weather: RaceWeather }) {
  const rain = weather.rain_probability;
  return (
    <div className="card p-5 sm:p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">Race conditions</span>
        <span className="chip !h-6 !text-[11.5px]">{WEATHER_SOURCE[weather.source]}</span>
      </div>
      <div className="mt-3 font-display text-[19px]">{weatherOutlook(rain)}</div>
      <dl className="mt-auto pt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="eyebrow">Rain chance</dt>
          <dd className="font-display text-[24px] tabular mt-0.5">{pctShort(rain)}</dd>
          <div aria-hidden className="mt-2 h-[6px] rounded-full bg-paper-deeper overflow-hidden">
            <div className="h-full rounded-full bg-team-williams" style={{ width: `${Math.max(2, rain * 100)}%` }} />
          </div>
        </div>
        <div>
          <dt className="eyebrow">Air temp</dt>
          <dd className="font-display text-[24px] tabular mt-0.5">{Math.round(weather.temp_c)}°C</dd>
        </div>
      </dl>
    </div>
  );
}

/* ================================================================== */
/* Home-page spotlight                                                */
/* ================================================================== */

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
              <div className="font-display text-[28px] leading-none tabular">{pct(d.win_probability)}</div>
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
      <dd className="font-display text-[18px] sm:text-[20px] mt-1 truncate">{value}</dd>
    </div>
  );
}

function EmptyState({ message }: { message: string | null }) {
  return (
    <div className="card p-7 md:p-10">
      <h3 className="font-display text-xl">Forecast temporarily unavailable</h3>
      <p className="mt-2 text-sm text-muted max-w-xl">
        {message ?? "Please check back shortly."} Forecasts refresh as new race and qualifying data arrives.
      </p>
    </div>
  );
}
