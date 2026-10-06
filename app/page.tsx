import { Suspense } from "react";
import Hero from "./components/Hero";
import DriversTable from "./components/DriversTable";
import ConstructorsTable from "./components/ConstructorsTable";
import { ForecastSnapshot } from "./components/Forecast";
import { LastRaceCard, TitleFightCard, UpcomingRaces } from "./components/HomeCards";
import SectionTitle from "./components/SectionTitle";
import { HeroSkeleton, ColumnSkeleton } from "./components/Skeletons";
import {
  getCalendar,
  getConstructorStandings,
  getDriverStandings,
  getNextPrediction,
  pickLastCompleted,
  pickNextRace,
} from "@/lib/api";
import { getCircuit, getRaceResults } from "@/lib/jolpica";

// Allow the forecast's server render up to 60s: the backend's /predictions/next
// can take several seconds cold, and the default serverless cap would abort it.
// Vercel Hobby permits up to 60s.
export const maxDuration = 60;
export const revalidate = 600;

/** Overview: next race, the three things that changed, standings, what's next. */
export default function Home() {
  return (
    <main className="flex-1 w-full">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <section className="pt-5">
        <div className="container-max grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Suspense fallback={<ColumnSkeleton rows={6} />}>
            <ForecastCard />
          </Suspense>
          <Suspense fallback={<ColumnSkeleton rows={5} />}>
            <LastRaceSection />
          </Suspense>
          <Suspense fallback={<ColumnSkeleton rows={4} />}>
            <TitleFightSection />
          </Suspense>
        </div>
      </section>

      <section className="section-y">
        <div className="container-max">
          <Suspense fallback={<SectionTitle kicker="Standings" title="Championship" />}>
            <StandingsTitle />
          </Suspense>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
            <Suspense fallback={<ColumnSkeleton rows={10} />}>
              <DriversColumn />
            </Suspense>
            <Suspense fallback={<ColumnSkeleton rows={11} />}>
              <ConstructorsColumn />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="pb-4">
        <div className="container-max">
          <SectionTitle kicker="Calendar" title="Coming up" action={{ href: "/calendar", label: "Full calendar" }} />
          <div className="mt-6">
            <Suspense fallback={<ColumnSkeleton rows={2} />}>
              <UpcomingSection />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Async server components — each owns its own fetch                  */
/* ------------------------------------------------------------------ */

async function HeroSection() {
  const cal = await getCalendar();
  const next = pickNextRace(cal.races);
  if (!next) return null;
  const circuit = await getCircuit(next.round);
  return <Hero race={next} totalRounds={cal.races.length} circuitId={circuit?.circuitId} />;
}

async function ForecastCard() {
  return <ForecastSnapshot data={await getNextPrediction()} />;
}

async function LastRaceSection() {
  const cal = await getCalendar();
  const lastRace = pickLastCompleted(cal.races);
  const results = lastRace ? await getRaceResults(lastRace.round) : null;
  const podium = [...(results?.Results ?? [])]
    .sort((a, b) => Number(a.position) - Number(b.position))
    .slice(0, 3);
  return <LastRaceCard race={lastRace} podium={podium} />;
}

async function TitleFightSection() {
  return <TitleFightCard drivers={await getDriverStandings()} />;
}

async function StandingsTitle() {
  const cal = await getCalendar();
  const done = cal.races.filter((r) => r.is_completed).length;
  return (
    <SectionTitle
      kicker={`After round ${done} of ${cal.races.length}`}
      title="Championship"
      meta={`${cal.races.length - done} rounds to go`}
    />
  );
}

async function DriversColumn() {
  return <DriversTable drivers={await getDriverStandings()} />;
}

async function ConstructorsColumn() {
  return <ConstructorsTable teams={await getConstructorStandings()} />;
}

async function UpcomingSection() {
  const cal = await getCalendar();
  const upcoming = cal.races.filter((r) => !r.is_completed).slice(0, 4);
  if (!upcoming.length) return <p className="text-sm text-muted">The season is complete.</p>;
  return <UpcomingRaces races={upcoming} />;
}
