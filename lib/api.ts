import type {
  CalendarResponse,
  ConstructorStanding,
  DriverStanding,
  PaddockIntel,
  PredictionResponse,
} from "./types";
import {
  MOCK_CALENDAR,
  MOCK_CONSTRUCTORS,
  MOCK_DRIVERS,
  buildMockIntel,
  buildMockPredictions,
} from "./mocks";

/**
 * Server-side data layer for LightsOut.
 *
 * Server components call the lightsout-api backend directly here — there is
 * no CORS concern on the server, and prerender works without a self-
 * referential URL. The /api/* route handlers exist so any future client-side
 * consumer hits the same proxy surface (and so NEXT_PUBLIC_API_URL stays the
 * only config knob).
 *
 * On unreachable backend we fall through to deterministic mock data so the
 * UI is never broken in dev or in unrelated previews.
 */

export function backendUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
  const season = process.env.NEXT_PUBLIC_SEASON ?? "2026";
  const sep = path.includes("?") ? "&" : "?";
  return `${base}${path}${sep}season=${season}`;
}

async function tryGet<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(backendUrl(path), {
      next: { revalidate },
      signal: AbortSignal.timeout(4000),
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

export async function getNextPrediction(): Promise<PredictionResponse | null> {
  return (await tryGet<PredictionResponse>("/predictions/next", 1800)) ?? buildMockPredictions();
}

export async function getPaddockIntel(): Promise<PaddockIntel | null> {
  const cal = await getCalendar();
  const lastCompleted = [...cal.rounds].reverse().find((r) => r.status === "completed");
  const round = lastCompleted?.round ?? 3;
  const remote = await tryGet<PaddockIntel>(`/paddock-intel?round=${round}`, 1800);
  return remote ?? buildMockIntel(round);
}
