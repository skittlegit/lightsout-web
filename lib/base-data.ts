import snapshot from "./data/base-data.json";
import type { CalendarResponse, Race } from "./types";

/** Recompute date-dependent flags on every read, including snapshot fallbacks. */
export function calendarForToday(calendar: CalendarResponse, now = new Date()): CalendarResponse {
  const today = now.toISOString().slice(0, 10);
  const races: Race[] = [...calendar.races]
    .sort((a, b) => a.round - b.round)
    .map((race) => ({ ...race, is_completed: !!race.race_date && race.race_date < today, is_next: false }));
  const next = races.find((race) => race.race_date && !race.is_completed);
  if (next) next.is_next = true;
  return { season: calendar.season, races };
}

export function fallbackCalendar(season: number): CalendarResponse {
  return calendarForToday(season === snapshot.season ? snapshot.calendar : { season, races: [] });
}

export function fallbackDrivers(season: number) {
  return season === snapshot.season ? snapshot.drivers : [];
}

export function fallbackConstructors(season: number) {
  return season === snapshot.season ? snapshot.constructors : [];
}
