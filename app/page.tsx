import { Suspense } from "react";
import Masthead from "./components/Masthead";
import Hero from "./components/Hero";
import SeasonCalendar from "./components/SeasonCalendar";
import DriversTable from "./components/DriversTable";
import ConstructorsTable from "./components/ConstructorsTable";
import PaddockIntelView from "./components/PaddockIntel";
import Forecast from "./components/Forecast";
import Footer from "./components/Footer";
import SectionAnchors from "./components/SectionAnchors";
import SmoothScroll from "./components/SmoothScroll";
import Reveal from "./components/Reveal";
import TickerSection from "./components/TickerSection";
import {
  HeroSkeleton,
  CalendarSkeleton,
  ColumnSkeleton,
  ForecastSkeleton,
} from "./components/Skeletons";
import {
  getCalendar,
  getConstructorStandings,
  getDriverStandings,
  getNextPrediction,
  pickLastCompleted,
  pickNextRace,
} from "@/lib/api";

export default function Home() {
  return (
    <>
      <a href="#hero" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <SectionAnchors />

      {/* Top race-radio ticker */}
      <Suspense fallback={<div className="h-[36px] bg-ink" aria-hidden />}>
        <TickerSection />
      </Suspense>

      <main id="hero" className="flex-1 w-full">
        <Reveal>
          <Masthead />
        </Reveal>

        {/* Next Race */}
        <Reveal delay={60}>
          <Suspense fallback={<HeroSkeleton />}>
            <HeroSection />
          </Suspense>
        </Reveal>

        {/* Calendar */}
        <Reveal delay={120}>
          <Suspense fallback={<CalendarSkeleton />}>
            <CalendarSection />
          </Suspense>
        </Reveal>

        {/* Drivers / Constructors / Last Race — three-column block */}
        <Reveal delay={180}>
          <ThreeColumnBlock />
        </Reveal>

        {/* Forecast */}
        <Reveal delay={220}>
          <Suspense fallback={<ForecastSkeleton />}>
            <ForecastSection />
          </Suspense>
        </Reveal>

        <Footer />
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Async server components — each owns its own fetch                  */
/* ------------------------------------------------------------------ */

async function HeroSection() {
  const cal = await getCalendar();
  const next = pickNextRace(cal.races);
  if (!next) return null;
  return <Hero race={next} totalRounds={cal.races.length} />;
}

async function CalendarSection() {
  const cal = await getCalendar();
  return <SeasonCalendar races={cal.races} season={cal.season} />;
}

function ThreeColumnBlock() {
  return (
    <section className="section-y">
      <div className="container-max grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-14">
        <div id="drivers">
          <Suspense fallback={<ColumnSkeleton rows={10} />}>
            <DriversColumn />
          </Suspense>
        </div>
        <div id="constructors">
          <Suspense fallback={<ColumnSkeleton rows={11} />}>
            <ConstructorsColumn />
          </Suspense>
        </div>
        <div id="paddock" className="md:col-span-2 lg:col-span-1">
          <Suspense fallback={<ColumnSkeleton rows={5} />}>
            <PaddockColumn />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function DriversColumn() {
  const drivers = await getDriverStandings();
  return <DriversTable drivers={drivers} />;
}

async function ConstructorsColumn() {
  const teams = await getConstructorStandings();
  return <ConstructorsTable teams={teams} />;
}

async function PaddockColumn() {
  const [cal, drivers] = await Promise.all([getCalendar(), getDriverStandings()]);
  const lastRace = pickLastCompleted(cal.races);
  return <PaddockIntelView lastRace={lastRace} drivers={drivers} />;
}

async function ForecastSection() {
  const data = await getNextPrediction();
  return <Forecast data={data} />;
}
