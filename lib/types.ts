/**
 * Mirrors the lightsout-api Pydantic schemas (app/schemas/predictions.py).
 * Shapes here match the deployed `/openapi.json` directly.
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
  | "audi"
  | "haas"
  | "cadillac";

/* ============================================================ */
/* Standings                                                    */
/* ============================================================ */

export interface DriverStanding {
  position: number;
  driver_code: string;
  driver_name: string;
  team: string;
  points: number;
  wins: number;
}

export interface ConstructorStanding {
  position: number;
  team: string;
  points: number;
  wins: number;
}

/* ============================================================ */
/* Calendar                                                     */
/* ============================================================ */

export interface Race {
  season: number;
  round: number;
  race_name: string;
  circuit: string;
  country: string;
  race_date: string; // ISO date "YYYY-MM-DD"
  is_next: boolean;
  is_completed: boolean;
}

export interface CalendarResponse {
  season: number;
  races: Race[];
}

/* ============================================================ */
/* Predictions                                                  */
/* ============================================================ */

export interface PredictedPole {
  driver_code: string;
  driver_name: string;
  team: string;
  confidence: number;
}

export interface DriverPrediction {
  driver_code: string;
  driver_name: string;
  team: string;
  expected_position: number;
  win_probability: number;
  podium_probability: number;
  points_probability: number;
  /** Length 20, sums to 1.0; index k = P(finish in P(k+1)) */
  position_distribution: number[];
}

export interface ModePrediction {
  generated_at: string;
  model_version: string;
  n_simulations: number;
  predicted_pole: PredictedPole | null;
  drivers: DriverPrediction[];
}

export type PredictionStatus = "ok" | "model_unavailable";

export interface PredictionResponse {
  season: number;
  round: number;
  race_name: string;
  circuit: string;
  race_date: string;
  pre_quali: ModePrediction | null;
  post_quali: ModePrediction | null;
  status: PredictionStatus;
  message?: string | null;
}
