import Link from "next/link";
import type { Route } from "next";
import { ForecastPanel, activeMode, weatherOutlook } from "@/app/components/Forecast";
import LocalStartTime from "@/app/components/LocalStartTime";
import { BannerChip, BannerStat } from "@/app/components/ui";
import { getNextPrediction } from "@/lib/api";
import { pctShort, raceStartISO, relativeTimeUpper, splitRaceName } from "@/lib/format";

// The backend's /predictions/next can take several seconds cold.
export const maxDuration = 60;
export const revalidate = 600;
export const metadata = {
  title: "Forecast",
  description: "Win, podium and points probabilities for the next Formula 1 race.",
};

export default async function ForecastPage() {
  const data = await getNextPrediction();
  const mode = activeMode(data);
  const { head, tail } = splitRaceName(data.race_name);

  return (
    <main className="flex-1 w-full">
      <section className="pt-6 md:pt-8">
        <div className="container-max">
          <div className="panel-carbon overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip chip-red">Round {data.round} forecast</span>
              {mode && <BannerChip>{data.post_quali ? "Updated after qualifying" : "Before qualifying"}</BannerChip>}
              {mode && <BannerChip>Model {mode.model_version}</BannerChip>}
            </div>
            <div className="mt-6 flex items-end justify-between gap-x-10 gap-y-6 flex-wrap">
              <h1 className="headline h-detail">
                {head}
                {tail && <> <em>{tail}</em></>}
              </h1>
              {data.round > 0 && (
                <Link href={`/races/${data.round}` as Route} className="btn btn-ghost">
                  Race details <span aria-hidden>→</span>
                </Link>
              )}
            </div>
            <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 border-t border-rule pt-6">
              <BannerStat
                label="Lights out (your time)"
                value={
                  <span className="text-[clamp(1rem,1.6vw,1.15rem)]">
                    {data.race_time && data.race_date ? <LocalStartTime iso={raceStartISO(data.race_date, data.race_time)} /> : "TBC"}
                  </span>
                }
              />
              <BannerStat
                label="Conditions"
                value={<span className="text-[clamp(1rem,1.6vw,1.15rem)]">{data.weather ? weatherOutlook(data.weather.rain_probability) : "—"}</span>}
              />
              <BannerStat label="Rain chance" value={data.weather ? pctShort(data.weather.rain_probability) : "—"} />
              <BannerStat
                label="Updated"
                value={<span className="text-[clamp(1rem,1.6vw,1.15rem)]">{mode ? relativeTimeUpper(mode.generated_at).toLowerCase() : "—"}</span>}
              />
            </dl>
          </div>
        </div>
      </section>

      <div className="container-max pt-[var(--section-y)]">
        <ForecastPanel data={data} />

        <section className="pt-[var(--section-y)]" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="font-display text-[20px]">How the forecast works</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Explainer step="1" title="Learn from history">
              Gradient-boosted models trained on every race since 2018 predict a likely finishing range for each driver from
              recent form, team pace, track history and race-day weather.
            </Explainer>
            <Explainer step="2" title="Simulate the race">
              Each driver&apos;s range becomes a distribution, and 10,000 race orders are drawn from them. Counting where
              everyone finishes gives the probabilities above.
            </Explainer>
            <Explainer step="3" title="Update after qualifying">
              Once qualifying is published, a second model adds grid position and qualifying pace, and the forecast switches
              to it automatically.
            </Explainer>
          </div>
        </section>
      </div>
    </main>
  );
}

function Explainer({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <span className="inline-grid place-items-center w-8 h-8 rounded-full bg-f1 text-white font-display text-[14px]">
        {step}
      </span>
      <h3 className="font-display text-[17px] mt-4">{title}</h3>
      <p className="mt-2 text-[14.5px] text-muted leading-relaxed">{children}</p>
    </div>
  );
}
