import type {
  CalendarResponse,
  ConstructorStanding,
  DriverStanding,
  PredictionResponse,
  Race,
} from "./types";
import { calendarForToday, fallbackCalendar, fallbackConstructors, fallbackDrivers } from "./base-data";
import { getSeasonCalendar, getSeasonDriverStandings, getSeasonConstructorStandings } from "./jolpica";

/**
 * Server-side data layer for LightsOut.
 *
 * Server components call the lightsout-api backend directly here — there is
 * no CORS concern on the server, and prerender works without a self-
 * referential URL.
 *
 * Base data falls back to live Jolpica, then a verified offline snapshot.
 * Forecast failures show an unavailable state for the actual next race.
 */

export const SEASON = process.env.NEXT_PUBLIC_SEASON ?? "2026";
const configuredBase = (process.env.NEXT_PUBLIC_API_URL?.trim() || "https://lightsout-api.onrender.com/api").replace(/\/$/, "");
// Migrate the previous deployment address, including existing production envs.
const migratedBase = configuredBase.replace("https://lightsout-api.up.railway.app", "https://lightsout-api.onrender.com");
const BASE = migratedBase.endsWith("/api") ? migratedBase : `${migratedBase}/api`;

export function backendUrl(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${BASE}${path}${sep}season=${SEASON}`;
}

async function tryGet<T>(
  path: string,
  revalidate: number,
  timeoutMs = 25000,
): Promise<T | null> {
  try {
    const res = await fetch(backendUrl(path), {
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      console.warn(`LightsOut ${path} returned HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`LightsOut ${path} fetch failed`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
  return (await tryGet<DriverStanding[]>("/standings/drivers", 600)) ??
    (await getSeasonDriverStandings()) ?? fallbackDrivers(Number(SEASON));
}

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  return (await tryGet<ConstructorStanding[]>("/standings/constructors", 600)) ??
    (await getSeasonConstructorStandings()) ?? fallbackConstructors(Number(SEASON));
}

export async function getCalendar(): Promise<CalendarResponse> {
  // 30 min, not 24h: the calendar's is_next / is_completed flags flip the moment
  // a race finishes, and the hero + "next race" derive from them. A day-long
  // cache left a completed race showing as "up next" long after the checkered flag.
  const calendar = (await tryGet<CalendarResponse>("/calendar", 1800)) ??
    (await getSeasonCalendar()) ?? fallbackCalendar(Number(SEASON));
  return calendarForToday(calendar);
}

export async function getNextPrediction(): Promise<PredictionResponse> {
  // /predictions/next is the slow endpoint (current-season form fetches + Monte
  // Carlo); a cold compute runs ~8s and a woken free-tier instance far longer.
  // Give it a generous timeout so the real forecast renders instead of falling
  // back to the mock. Paired with maxDuration on the page so the serverless
  // function isn't killed first, and an external keep-warm ping on the backend.
  const prediction = await tryGet<PredictionResponse>("/predictions/next", 1800, 25000);
  if (prediction) return prediction;
  const next = pickNextRace((await getCalendar()).races);
  return {
    season: Number(SEASON), round: next?.round ?? 0,
    race_name: next?.race_name ?? "No upcoming race",
    circuit: next?.circuit ?? "", race_date: next?.race_date ?? "",
    pre_quali: null, post_quali: null, status: "model_unavailable",
    message: next ? "Forecast temporarily unavailable. Please try again shortly." : "No upcoming race in this season.",
  };
}

export async function getPrediction(round: number): Promise<PredictionResponse | null> {
  return await tryGet<PredictionResponse>(`/predictions/${round}`, 1800);
}

/** Helper used by Hero/page to pick "next" race from a CalendarResponse. */
export function pickNextRace(races: Race[]): Race | null {
  return races.find((r) => r.is_next) ?? races.find((r) => !r.is_completed) ?? null;
}

/** Helper for the last completed race (used by the Last Race recap). */
export function pickLastCompleted(races: Race[]): Race | null {
  return [...races].reverse().find((r) => r.is_completed) ?? null;
}
