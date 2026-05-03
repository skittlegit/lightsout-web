import type {
  CalendarResponse,
  ConstructorStanding,
  DriverStanding,
  PredictionResponse,
  Race,
} from "./types";

const SEASON = Number(process.env.NEXT_PUBLIC_SEASON ?? 2026);

/* ============================================================ */
/* Standings — shapes match backend exactly                     */
/* ============================================================ */

export const MOCK_DRIVERS: DriverStanding[] = [
  { position: 1, points: 75, wins: 2, driver_code: "ANT", driver_name: "Andrea Kimi Antonelli", team: "Mercedes" },
  { position: 2, points: 68, wins: 1, driver_code: "RUS", driver_name: "George Russell", team: "Mercedes" },
  { position: 3, points: 55, wins: 0, driver_code: "LEC", driver_name: "Charles Leclerc", team: "Ferrari" },
  { position: 4, points: 43, wins: 0, driver_code: "HAM", driver_name: "Lewis Hamilton", team: "Ferrari" },
  { position: 5, points: 33, wins: 0, driver_code: "NOR", driver_name: "Lando Norris", team: "McLaren" },
  { position: 6, points: 28, wins: 0, driver_code: "PIA", driver_name: "Oscar Piastri", team: "McLaren" },
  { position: 7, points: 17, wins: 0, driver_code: "BEA", driver_name: "Oliver Bearman", team: "Haas F1 Team" },
  { position: 8, points: 16, wins: 0, driver_code: "GAS", driver_name: "Pierre Gasly", team: "Alpine F1 Team" },
  { position: 9, points: 16, wins: 0, driver_code: "VER", driver_name: "Max Verstappen", team: "Red Bull" },
  { position: 10, points: 10, wins: 0, driver_code: "LAW", driver_name: "Liam Lawson", team: "RB F1 Team" },
];

export const MOCK_CONSTRUCTORS: ConstructorStanding[] = [
  { position: 1, points: 143, wins: 3, team: "Mercedes" },
  { position: 2, points: 98, wins: 0, team: "Ferrari" },
  { position: 3, points: 61, wins: 0, team: "McLaren" },
  { position: 4, points: 20, wins: 0, team: "Red Bull" },
  { position: 5, points: 18, wins: 0, team: "Haas F1 Team" },
  { position: 6, points: 17, wins: 0, team: "Alpine F1 Team" },
  { position: 7, points: 14, wins: 0, team: "RB F1 Team" },
  { position: 8, points: 2, wins: 0, team: "Audi" },
  { position: 9, points: 2, wins: 0, team: "Williams" },
  { position: 10, points: 0, wins: 0, team: "Cadillac F1 Team" },
  { position: 11, points: 0, wins: 0, team: "Aston Martin" },
];

/* ============================================================ */
/* Calendar — current 2026 season (Bahrain & Jeddah cancelled)  */
/* ============================================================ */

const MOCK_RACES: Race[] = [
  { season: SEASON, round: 1, race_name: "Australian Grand Prix", circuit: "Albert Park Grand Prix Circuit", country: "Australia", race_date: "2026-03-08", is_next: false, is_completed: true },
  { season: SEASON, round: 2, race_name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", country: "China", race_date: "2026-03-15", is_next: false, is_completed: true },
  { season: SEASON, round: 3, race_name: "Japanese Grand Prix", circuit: "Suzuka Circuit", country: "Japan", race_date: "2026-03-29", is_next: false, is_completed: true },
  { season: SEASON, round: 4, race_name: "Miami Grand Prix", circuit: "Miami International Autodrome", country: "USA", race_date: "2026-05-03", is_next: true, is_completed: false },
  { season: SEASON, round: 5, race_name: "Canadian Grand Prix", circuit: "Circuit Gilles Villeneuve", country: "Canada", race_date: "2026-05-24", is_next: false, is_completed: false },
  { season: SEASON, round: 6, race_name: "Monaco Grand Prix", circuit: "Circuit de Monaco", country: "Monaco", race_date: "2026-06-07", is_next: false, is_completed: false },
  { season: SEASON, round: 7, race_name: "Barcelona Grand Prix", circuit: "Circuit de Barcelona-Catalunya", country: "Spain", race_date: "2026-06-14", is_next: false, is_completed: false },
  { season: SEASON, round: 8, race_name: "Austrian Grand Prix", circuit: "Red Bull Ring", country: "Austria", race_date: "2026-06-28", is_next: false, is_completed: false },
  { season: SEASON, round: 9, race_name: "British Grand Prix", circuit: "Silverstone Circuit", country: "UK", race_date: "2026-07-05", is_next: false, is_completed: false },
  { season: SEASON, round: 10, race_name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", country: "Belgium", race_date: "2026-07-26", is_next: false, is_completed: false },
];

export const MOCK_CALENDAR: CalendarResponse = {
  season: SEASON,
  races: MOCK_RACES,
};

/* ============================================================ */
/* Predictions fallback — model unavailable state               */
/* ============================================================ */

export const MOCK_PREDICTIONS_UNAVAILABLE: PredictionResponse = {
  season: SEASON,
  round: 4,
  race_name: "Miami Grand Prix",
  circuit: "Miami International Autodrome",
  race_date: "2026-05-03",
  pre_quali: null,
  post_quali: null,
  status: "model_unavailable",
  message: "Backend unreachable — model artifacts not loaded.",
};
