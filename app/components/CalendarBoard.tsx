"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import type { Race } from "@/lib/types";
import {
  formatRaceDate,
  countryCode,
  daysUntil,
  countdownLabel,
} from "@/lib/format";
import { downloadRaceIcs } from "@/lib/ics";
import CalendarScroller from "./CalendarScroller";

type View = "strip" | "list";
const STORE_KEY = "lo:calendar-view";

/* View preference lives in localStorage, read through useSyncExternalStore so
   it's SSR-safe (server always sees "strip") with no hydration mismatch. */
const viewListeners = new Set<() => void>();
function readView(): View {
  try {
    return localStorage.getItem(STORE_KEY) === "list" ? "list" : "strip";
  } catch {
    return "strip";
  }
}
function setStoredView(v: View) {
  try {
    localStorage.setItem(STORE_KEY, v);
  } catch {
    /* private mode — non-fatal */
  }
  viewListeners.forEach((l) => l());
}
function subscribeView(cb: () => void) {
  viewListeners.add(cb);
  return () => {
    viewListeners.delete(cb);
  };
}

/** False on the server + first paint, true once hydrated — no effect needed. */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function CalendarBoard({
  races,
  season,
}: {
  races: Race[];
  season: number;
}) {
  const view = useSyncExternalStore<View>(subscribeView, readView, () => "strip");
  // Day-counts depend on the clock, so only compute them post-hydration.
  const today = useMounted() ? new Date() : null;

  return (
    <div>
      <Toolbar view={view} onChange={setStoredView} />

      {view === "strip" ? (
        <CalendarScroller ariaLabel={`${season} season rounds`}>
          {races.map((r) => (
            <StripCard key={r.round} race={r} today={today} />
          ))}
        </CalendarScroller>
      ) : (
        <ol className="border-t border-rule" aria-label={`${season} season rounds`}>
          {races.map((r) => (
            <ListRow key={r.round} race={r} today={today} />
          ))}
        </ol>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar — segmented Strip / List view toggle                       */
/* ------------------------------------------------------------------ */

function Toolbar({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 mb-4 md:mb-5">
      <span className="eyebrow hidden sm:inline mr-1">View</span>
      <div
        className="inline-flex border border-rule"
        role="group"
        aria-label="Calendar view"
      >
        <ViewButton active={view === "strip"} onClick={() => onChange("strip")}>
          Strip
        </ViewButton>
        <ViewButton active={view === "list"} onClick={() => onChange("list")}>
          List
        </ViewButton>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors ${
        active
          ? "bg-ink text-paper"
          : "bg-paper text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Strip card — horizontal scroller variant                           */
/* ------------------------------------------------------------------ */

function StripCard({ race, today }: { race: Race; today: Date | null }) {
  const { is_next: isNext, is_completed: completed } = race;
  const code = countryCode(race.country);
  const days = today && isNext ? daysUntil(race.race_date, today) : null;

  const base =
    "shrink-0 w-[160px] sm:w-[180px] md:w-[200px] aspect-[4/5] flex flex-col justify-between p-4 transition-all duration-200 hover-lift";

  let variant = "bg-paper border border-rule hover:border-ink";
  if (isNext) variant = "bg-ink text-paper border border-ink";
  else if (completed)
    variant =
      "bg-paper-deep border border-rule text-muted hover:text-ink hover:border-rule-strong";

  return (
    <li role="listitem" data-next={isNext || undefined} className="snap-start">
      <Link
        href={`/races/${race.round}`}
        className={`${base} ${variant}`}
        aria-label={`${race.race_name}, round ${race.round}, ${formatRaceDate(race.race_date)}${isNext ? " · next race" : completed ? " · completed" : ""}`}
      >
        <div className="flex items-start justify-between">
          <span
            className={`font-mono text-[10px] tracking-[0.16em] ${
              isNext ? "text-paper/70" : completed ? "text-muted-soft" : "text-muted"
            }`}
          >
            R{String(race.round).padStart(2, "0")}
          </span>
          <span className="flex items-center gap-1.5">
            {race.has_sprint && (
              <span
                className={`font-mono text-[8px] tracking-[0.14em] uppercase px-1 py-[1px] border ${
                  isNext ? "border-paper/40 text-paper/80" : "border-f1/50 text-f1"
                }`}
                title="Sprint weekend"
              >
                Sprint
              </span>
            )}
            {isNext && (
              <span className="pulse-dot inline-block w-[8px] h-[8px] rounded-full bg-f1" />
            )}
            {completed && !isNext && (
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted-soft uppercase">
                Done
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span
            className={`font-mono tabular text-[11px] tracking-[0.18em] ${
              isNext ? "text-f1" : completed ? "text-muted-soft" : "text-ink"
            }`}
          >
            {code}
          </span>
          <span
            className={`font-display italic text-2xl leading-tight ${
              isNext ? "text-paper" : completed ? "text-ink/70" : "text-ink"
            }`}
          >
            {race.country}
          </span>
          <span
            className={`font-mono tabular text-[10px] tracking-[0.12em] mt-2 uppercase ${
              isNext ? "text-paper/60" : "text-muted"
            }`}
          >
            {formatRaceDate(race.race_date)}
          </span>
          {days !== null && (
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-f1-soft">
              {countdownLabel(days)}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* List row — vertical, scannable, with Add-to-calendar               */
/* ------------------------------------------------------------------ */

function ListRow({ race, today }: { race: Race; today: Date | null }) {
  const { is_next: isNext, is_completed: completed } = race;
  const code = countryCode(race.country);
  const days = today && isNext ? daysUntil(race.race_date, today) : null;

  return (
    <li
      className={`flex items-stretch border-b border-rule row-hover ${
        isNext ? "bg-paper-deep" : ""
      }`}
    >
      <Link
        href={`/races/${race.round}`}
        className="flex flex-1 items-center gap-3 sm:gap-5 min-w-0 py-3.5 pl-1 pr-2"
        aria-label={`${race.race_name}, round ${race.round}, ${formatRaceDate(race.race_date)}${isNext ? " · next race" : completed ? " · completed" : ""}`}
      >
        <span
          className={`font-mono text-[11px] tracking-[0.14em] w-8 shrink-0 ${
            completed ? "text-muted-soft" : "text-muted"
          }`}
        >
          R{String(race.round).padStart(2, "0")}
        </span>
        <span
          className={`font-mono tabular text-[11px] tracking-[0.16em] w-9 shrink-0 ${
            isNext ? "text-f1" : completed ? "text-muted-soft" : "text-ink"
          }`}
        >
          {code}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block font-display italic text-lg leading-tight truncate ${
              completed && !isNext ? "text-ink/70" : "text-ink"
            }`}
          >
            {race.country}
          </span>
          <span className="block font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase truncate">
            {race.race_name}
          </span>
        </span>

        <span className="flex items-center gap-2 shrink-0">
          {race.has_sprint && (
            <span
              className="hidden sm:inline font-mono text-[8px] tracking-[0.14em] uppercase px-1 py-[1px] border border-f1/50 text-f1"
              title="Sprint weekend"
            >
              Sprint
            </span>
          )}
          {isNext ? (
            <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-f1">
              <span className="pulse-dot inline-block w-[7px] h-[7px] rounded-full bg-f1" />
              {days !== null ? countdownLabel(days) : "Next"}
            </span>
          ) : completed ? (
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted-soft uppercase">
              Done
            </span>
          ) : null}
        </span>

        <span className="font-mono tabular text-[11px] tracking-[0.12em] text-muted uppercase w-[58px] text-right shrink-0">
          {formatRaceDate(race.race_date)}
        </span>
      </Link>

      <IcsButton race={race} />
    </li>
  );
}

function IcsButton({ race }: { race: Race }) {
  return (
    <button
      type="button"
      onClick={() => downloadRaceIcs(race)}
      title="Add to calendar (.ics)"
      aria-label={`Add ${race.race_name} to your calendar`}
      className="shrink-0 grid place-items-center w-11 border-l border-rule text-muted-soft hover:text-ink transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2.5" y="3.5" width="11" height="10" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 6.5 H13.5 M5 2 V4.5 M11 2 V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 8.4 V11.6 M6.4 10 H9.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
