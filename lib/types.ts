/**
 * Mirrors the lightsout-api Pydantic schemas.
 * If the backend changes, regenerate (consider `npm run gen:types`
 * with openapi-typescript against /openapi.json).
 */

export type TeamId =
  | "mercedes"
  | "ferrari"
  | "red_bull"
  | "mclaren"
  | "aston_martin"
  | "alpine"
  | "williams"
  | "racing_bulls"
  | "kick_sauber"
  | "haas"
  | "cadillac";

export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driver_code: string; // e.g. "VER"
  driver_name: string; // e.g. "Max Verstappen"
  team: string; // display name, e.g. "Red Bull Racing"
  team_id: TeamId;
}

export interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  team: string;
  team_id: TeamId;
}

export interface Race {
  round: number;
  season: number;
  name: string; // "Australian Grand Prix"
  country_code: string; // "AUS"
  country: string; // "Australia"
  locality: string; // "Melbourne"
  circuit_name: string; // "Albert Park Grand Prix Circuit"
  start_date: string; // ISO date "2026-03-13"
  race_date: string; // ISO date "2026-03-15"
  race_time?: string | null; // ISO time "13:00:00Z"
  laps?: number | null;
  distance_km?: number | null;
  lap_record?: {
    time: string; // "1:19.813"
    driver: string; // "Charles Leclerc"
    year: number;
  } | null;
  prior_pole?: {
    driver_name: string;
    driver_code: string;
    team: string;
  } | null;
  status: "completed" | "upcoming" | "next" | "live";
  results?: RaceResult[] | null;
}

export interface RaceResult {
  position: number;
  driver_code: string;
  driver_name: string;
  team: string;
  team_id: TeamId;
  gap?: string | null; // "+12.345" or "+1 LAP"
  status?: string | null; // "Finished", "DNF: ..."
}

export interface CalendarResponse {
  season: number;
  rounds: Race[];
  next_round?: number | null;
}

export interface DriverPrediction {
  driver_code: string;
  driver_name: string;
  team: string;
  team_id: TeamId;
  expected_position: number;
  win_probability: number; // 0..1
  podium_probability: number; // 0..1
  points_probability: number; // 0..1 (top 10)
  /** Length-20 distribution; index 0 = P1 ... index 19 = P20. Sums to ~1. */
  position_distribution: number[];
}

export interface PolePrediction {
  driver_code: string;
  driver_name: string;
  team: string;
  team_id: TeamId;
  confidence: number; // 0..1
}

export interface ModePrediction {
  predicted_pole: PolePrediction | null;
  predicted_winner: DriverPrediction | null;
}

export interface PredictionResponse {
  season: number;
  round: number;
  race_name: string;
  generated_at: string; // ISO datetime
  model_version: string; // "preq-v1.2"
  n_simulations: number; // 10_000
  pre_quali: ModePrediction | null;
  post_quali: ModePrediction | null;
  drivers: DriverPrediction[]; // 20 entries, sorted by expected_position
}

export interface PaddockIntelTag {
  label: string; // "DEBUT", "ENGINE WAR", "CALENDAR"
}

export interface PaddockIntel {
  round: number; // most recent completed round
  race_name: string;
  podium: RaceResult[]; // top 3
  tags: PaddockIntelTag[];
  story: string; // 2-3 sentence editorial blurb
}
