import { Suspense } from "react";
import Hero from "./components/Hero";
import DriverCard from "./components/DriverCard";
import ConstructorsTable from "./components/ConstructorsTable";
import { ForecastSpotlight } from "./components/Forecast";
import ProgressionChart from "./components/ProgressionChart";
import RaceRecap from "./components/RaceRecap";
import UpcomingRaces from "./components/UpcomingRaces";
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
import { getCircuit, getDrivers, getRaceResults, getSeasonResults, getSeasonSprints } from "@/lib/jolpica";
import { raceRecap } from "@/lib/recap";
import { pointsProgression } from "@/lib/season";
import { formatRaceDate } from "@/lib/format";

// Allow the forecast's server render up to 60s: the backend's /predictions/next
// can take several seconds cold, and the default serverless cap would abort it.
// Vercel Hobby permits up to 60s.
export const maxDuration = 60;
export const revalidate = 600;

/**
 * Home: the race weekend up front, then championship leaders, the forecast,
 * the last race, the season so far, and what's coming up.
 */
export default function Home() {
  return (
    <main className="flex-1 w-full">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Section>
        <Suspense fallback={<ColumnSkeleton rows={4} />}>
          <LeadersSection />
        </Suspense>
      </Section>

      <Section>
        <Suspense fallback={<ColumnSkeleton rows={4} />}>
          <ForecastSection />
        </Suspense>
      </Section>

      <Section>
        <Suspense fallback={<ColumnSkeleton rows={4} />}>
          <LastRaceSection />
        </Suspense>
      </Section>

      <Section>
        <Suspense fallback={<ColumnSkeleton rows={6} />}>
          <SeasonSection />
        </Suspense>
      </Section>

      <Section>
        <Suspense fallback={<ColumnSkeleton rows={2} />}>
          <ComingUpSection />
        </Suspense>
      </Section>
    </main>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="pt-[var(--section-y)]">
      <div className="container-max">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Async server components — each owns its own fetch                  */
/* ------------------------------------------------------------------ */

async function HeroSection() {
  const cal = await getCalendar();
  const next = pickNextRace(cal.races);
  if (!next) return null;
  const previous = pickLastCompleted(cal.races);
  const following = cal.races.find((r) => r.round > next.round) ?? null;
  const [circuit, prevResults] = await Promise.all([
    getCircuit(next.round),
    previous ? getRaceResults(previous.round) : Promise.resolve(null),
  ]);
  const previousWinner = prevResults?.Results?.find((r) => r.position === "1") ?? null;
  return (
    <Hero
      race={next}
      totalRounds={cal.races.length}
      circuitId={circuit?.circuitId}
      previous={previous}
      previousWinner={previousWinner}
      following={following}
    />
  );
}

async function LeadersSection() {
  const [cal, drivers, teams, profiles] = await Promise.all([
    getCalendar(),
    getDriverStandings(),
    getConstructorStandings(),
    getDrivers(),
  ]);
  const done = cal.races.filter((r) => r.is_completed).length;
  const byCode = new Map(profiles.filter((p) => p.code).map((p) => [p.code!.toUpperCase(), p]));
  const leader = drivers[0];
  const second = drivers[1];

  return (
    <>
      <SectionTitle
        kicker={`After round ${done} of ${cal.races.length}`}
        title="Championship leaders"
        action={{ href: "/standings", label: "Full standings" }}
      />
      {leader && second && (
        <p className="mt-2 text-muted">
          {leader.driver_name} leads by {leader.points - second.points} points with {cal.races.length - done} rounds to go.
        </p>
      )}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1.15fr] gap-4">
        {drivers.slice(0, 3).map((d, i) => (
          <DriverCard key={d.driver_code} standing={d} profile={byCode.get(d.driver_code)} size={i === 0 ? "lg" : "md"} />
        ))}
        <ConstructorsTable teams={teams} limit={5} />
      </div>
    </>
  );
}

async function ForecastSection() {
  const data = await getNextPrediction();
  return (
    <>
      <SectionTitle
        kicker={`Forecast · Round ${data.round}`}
        title={`Who wins the ${data.race_name}?`}
        action={{ href: "/forecast", label: "Full forecast" }}
      />
      <div className="mt-6">
        <ForecastSpotlight data={data} />
      </div>
    </>
  );
}

async function LastRaceSection() {
  const cal = await getCalendar();
  const last = pickLastCompleted(cal.races);
  if (!last) return null;
  const results = (await getRaceResults(last.round))?.Results ?? [];
  const recap = raceRecap(results);
  return (
    <>
      <SectionTitle
        kicker={`Last race · Round ${last.round} · ${formatRaceDate(last.race_date)}`}
        title={last.race_name}
        action={{ href: `/races/${last.round}`, label: "Full results" }}
      />
      <div className="mt-6">
        {recap ? <RaceRecap results={results} recap={recap} /> : (
          <div className="card p-6 text-muted">Results will appear once they&apos;re published.</div>
        )}
      </div>
    </>
  );
}

async function SeasonSection() {
  const [results, sprints] = await Promise.all([getSeasonResults(), getSeasonSprints()]);
  if (!results) return null;
  return (
    <>
      <SectionTitle
        kicker="Season so far"
        title="The title race"
        action={{ href: "/standings", label: "Standings" }}
      />
      <div className="mt-6 card p-4 sm:p-6">
        <ProgressionChart data={pointsProgression(results, sprints ?? [], 5)} />
      </div>
    </>
  );
}

async function ComingUpSection() {
  const cal = await getCalendar();
  const next = pickNextRace(cal.races);
  // The hero covers the next race; list the rounds after it.
  const upcoming = cal.races.filter((r) => !r.is_completed && r.round !== next?.round).slice(0, 4);
  if (!upcoming.length) return null;
  return (
    <>
      <SectionTitle kicker="Calendar" title="Coming up" action={{ href: "/calendar", label: "Full calendar" }} />
      <div className="mt-6">
        <UpcomingRaces races={upcoming} />
      </div>
    </>
  );
}
