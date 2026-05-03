/**
 * Thin Jolpica F1 (Ergast-compatible) wrapper.
 * Used for the data the lightsout-api backend doesn't expose:
 *   - per-race results / qualifying / fastest laps
 *   - canonical driver / constructor / circuit identifiers
 *
 * Free, no API key, season-scoped.
 */

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const SEASON = process.env.NEXT_PUBLIC_SEASON ?? "2026";

interface MRData<T> {
  MRData: T;
}

interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface JolpicaCircuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface JolpicaDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface JolpicaConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface JolpicaRaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  Time?: { millis?: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed?: { units: string; speed: string };
  };
}

export interface JolpicaQualifyingResult {
  number: string;
  position: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface JolpicaRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: JolpicaCircuit;
  date: string;
  time?: string;
  Results?: JolpicaRaceResult[];
  QualifyingResults?: JolpicaQualifyingResult[];
}

interface RaceTable {
  season: string;
  round?: string;
  Races: JolpicaRace[];
}

async function jget<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${JOLPICA_BASE}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MRData<T>;
    return data.MRData;
  } catch {
    return null;
  }
}

/* ---------------- Drivers / Constructors ---------------- */

export async function getDrivers(season = SEASON): Promise<JolpicaDriver[]> {
  const data = await jget<{ DriverTable: { Drivers: JolpicaDriver[] } }>(
    `/${season}/drivers.json?limit=100`,
    86_400
  );
  return data?.DriverTable.Drivers ?? [];
}

export async function getConstructors(season = SEASON): Promise<JolpicaConstructor[]> {
  const data = await jget<{ ConstructorTable: { Constructors: JolpicaConstructor[] } }>(
    `/${season}/constructors.json?limit=100`,
    86_400
  );
  return data?.ConstructorTable.Constructors ?? [];
}

/* ---------------- Race results / qualifying / circuits ---------------- */

export async function getRaceResults(
  round: number,
  season = SEASON
): Promise<JolpicaRace | null> {
  const data = await jget<{ RaceTable: RaceTable }>(
    `/${season}/${round}/results.json?limit=100`,
    3_600
  );
  return data?.RaceTable.Races[0] ?? null;
}

export async function getQualifying(
  round: number,
  season = SEASON
): Promise<JolpicaRace | null> {
  const data = await jget<{ RaceTable: RaceTable }>(
    `/${season}/${round}/qualifying.json?limit=100`,
    3_600
  );
  return data?.RaceTable.Races[0] ?? null;
}

export async function getCircuit(
  round: number,
  season = SEASON
): Promise<JolpicaCircuit | null> {
  const data = await jget<{ CircuitTable: { Circuits: JolpicaCircuit[] } }>(
    `/${season}/${round}/circuits.json`,
    86_400
  );
  return data?.CircuitTable.Circuits[0] ?? null;
}

/* ---------------- Driver-scoped helpers ---------------- */

export async function getDriverResults(
  driverId: string,
  season = SEASON
): Promise<JolpicaRace[]> {
  const data = await jget<{ RaceTable: RaceTable }>(
    `/${season}/drivers/${driverId}/results.json?limit=50`,
    3_600
  );
  return data?.RaceTable.Races ?? [];
}

/* ---------------- Constructor-scoped helpers ---------------- */

export async function getConstructorResults(
  constructorId: string,
  season = SEASON
): Promise<JolpicaRace[]> {
  const data = await jget<{ RaceTable: RaceTable }>(
    `/${season}/constructors/${constructorId}/results.json?limit=100`,
    3_600
  );
  return data?.RaceTable.Races ?? [];
}

export async function getConstructorDrivers(
  constructorId: string,
  season = SEASON
): Promise<JolpicaDriver[]> {
  const data = await jget<{ DriverTable: { Drivers: JolpicaDriver[] } }>(
    `/${season}/constructors/${constructorId}/drivers.json`,
    86_400
  );
  return data?.DriverTable.Drivers ?? [];
}
