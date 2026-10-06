import Link from "next/link";
import type { Route } from "next";
import { PageHeader } from "@/app/components/SectionTitle";
import { ForecastPanel } from "@/app/components/Forecast";
import LocalStartTime from "@/app/components/LocalStartTime";
import { getNextPrediction } from "@/lib/api";
import { raceStartISO } from "@/lib/format";

// The backend's /predictions/next can take several seconds cold.
export const maxDuration = 60;
export const revalidate = 600;
export const metadata = {
  title: "Forecast",
  description: "Win, podium and points probabilities for the next Formula 1 race.",
};

export default async function ForecastPage() {
  const data = await getNextPrediction();

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker={`Round ${data.round} · model forecast`}
        title={data.race_name}
        description={
          <>
            Win, podium and points chances for every driver, from 10,000 simulated races.
            {data.race_time && data.race_date && (
              <>
                {" "}Lights out <span className="text-ink"><LocalStartTime iso={raceStartISO(data.race_date, data.race_time)} /></span>.
              </>
            )}
          </>
        }
        aside={
          data.round ? (
            <Link href={`/races/${data.round}` as Route} className="btn btn-ghost">
              Race details <span aria-hidden>→</span>
            </Link>
          ) : undefined
        }
      />

      <div className="container-max">
        <ForecastPanel data={data} />

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="sr-only">How the forecast works</h2>
          <Explainer step="1" title="Learn from history">
            Gradient-boosted models trained on every race since 2018 predict a likely finishing range for each driver from
            recent form, team pace, track history, and race-day weather.
          </Explainer>
          <Explainer step="2" title="Simulate the race">
            Each driver&apos;s range becomes a distribution, and 10,000 race orders are drawn from them. Counting where
            everyone finishes gives the probabilities above.
          </Explainer>
          <Explainer step="3" title="Update after qualifying">
            Once qualifying is published, a second model adds grid position and qualifying pace, and the forecast switches
            to it automatically.
          </Explainer>
        </section>
      </div>
    </main>
  );
}

function Explainer({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <span className="font-mono text-[12px] text-f1-soft">0{step}</span>
      <h3 className="font-display text-[17px] font-semibold mt-2">{title}</h3>
      <p className="mt-2 text-[14px] text-muted leading-relaxed">{children}</p>
    </div>
  );
}
