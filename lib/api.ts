import type {
  CalendarResponse,
  ConstructorStanding,
  DriverStanding,
  PredictionResponse,
  Race,
} from "./types";
import {
  MOCK_CALENDAR,
  MOCK_CONSTRUCTORS,
  MOCK_DRIVERS,
  MOCK_PREDICTIONS_UNAVAILABLE,
} from "./mocks";

/**
 * Server-side data layer for LightsOut.
 *
 * Server components call the lightsout-api backend directly here — there is
 * no CORS concern on the server, and prerender works without a self-
 * referential URL.
 *
 * On unreachable backend or non-OK response we fall through to deterministic
 * mock data so the UI is never broken in dev or in unrelated previews.
 */

const SEASON = process.env.NEXT_PUBLIC_SEASON ?? "2026";
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://lightsout-api.up.railway.app/api").replace(
  /\/$/,
  ""
);

export function backendUrl(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${BASE}${path}${sep}season=${SEASON}`;
}

async function tryGet<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(backendUrl(path), {
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
  return (await tryGet<DriverStanding[]>("/standings/drivers", 600)) ?? MOCK_DRIVERS;
}

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  return (await tryGet<ConstructorStanding[]>("/standings/constructors", 600)) ?? MOCK_CONSTRUCTORS;
}

export async function getCalendar(): Promise<CalendarResponse> {
  return (await tryGet<CalendarResponse>("/calendar", 86400)) ?? MOCK_CALENDAR;
}

export async function getNextPrediction(): Promise<PredictionResponse> {
  return (
    (await tryGet<PredictionResponse>("/predictions/next", 1800)) ??
    MOCK_PREDICTIONS_UNAVAILABLE
  );
}

export async function getPrediction(round: number): Promise<PredictionResponse | null> {
  return await tryGet<PredictionResponse>(`/predictions/${round}`, 1800);
}

/** Helper used by Hero/page to pick "next" race from a CalendarResponse. */
export function pickNextRace(races: Race[]): Race | null {
  return races.find((r) => r.is_next) ?? races.find((r) => !r.is_completed) ?? races[0] ?? null;
}

/** Helper for the last completed race (used by the Last Race recap). */
export function pickLastCompleted(races: Race[]): Race | null {
  return [...races].reverse().find((r) => r.is_completed) ?? null;
}
