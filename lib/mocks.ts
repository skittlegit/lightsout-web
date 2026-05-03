import type {
  CalendarResponse,
  ConstructorStanding,
  DriverPrediction,
  DriverStanding,
  PaddockIntel,
  PredictionResponse,
  Race,
  RaceResult,
  TeamId,
} from "./types";

const SEASON = Number(process.env.NEXT_PUBLIC_SEASON ?? 2026);

/* ============================================================ */
/* Standings                                                    */
/* ============================================================ */

const TEAM_DISPLAY: Record<TeamId, string> = {
  mercedes: "Mercedes",
  ferrari: "Ferrari",
  red_bull: "Red Bull Racing",
  mclaren: "McLaren",
  aston_martin: "Aston Martin",
  alpine: "Alpine",
  williams: "Williams",
  racing_bulls: "Racing Bulls",
  kick_sauber: "Kick Sauber",
  haas: "Haas",
  cadillac: "Cadillac",
};

export const MOCK_DRIVERS: DriverStanding[] = [
  { position: 1, points: 86, wins: 2, driver_code: "NOR", driver_name: "Lando Norris", team: TEAM_DISPLAY.mclaren, team_id: "mclaren" },
  { position: 2, points: 74, wins: 1, driver_code: "VER", driver_name: "Max Verstappen", team: TEAM_DISPLAY.red_bull, team_id: "red_bull" },
  { position: 3, points: 68, wins: 1, driver_code: "LEC", driver_name: "Charles Leclerc", team: TEAM_DISPLAY.ferrari, team_id: "ferrari" },
  { position: 4, points: 59, wins: 0, driver_code: "PIA", driver_name: "Oscar Piastri", team: TEAM_DISPLAY.mclaren, team_id: "mclaren" },
  { position: 5, points: 47, wins: 0, driver_code: "RUS", driver_name: "George Russell", team: TEAM_DISPLAY.mercedes, team_id: "mercedes" },
  { position: 6, points: 42, wins: 0, driver_code: "HAM", driver_name: "Lewis Hamilton", team: TEAM_DISPLAY.ferrari, team_id: "ferrari" },
  { position: 7, points: 31, wins: 0, driver_code: "ANT", driver_name: "Andrea Kimi Antonelli", team: TEAM_DISPLAY.mercedes, team_id: "mercedes" },
  { position: 8, points: 22, wins: 0, driver_code: "ALO", driver_name: "Fernando Alonso", team: TEAM_DISPLAY.aston_martin, team_id: "aston_martin" },
  { position: 9, points: 18, wins: 0, driver_code: "GAS", driver_name: "Pierre Gasly", team: TEAM_DISPLAY.alpine, team_id: "alpine" },
  { position: 10, points: 14, wins: 0, driver_code: "SAI", driver_name: "Carlos Sainz", team: TEAM_DISPLAY.williams, team_id: "williams" },
];

export const MOCK_CONSTRUCTORS: ConstructorStanding[] = [
  { position: 1, points: 145, wins: 2, team: TEAM_DISPLAY.mclaren, team_id: "mclaren" },
  { position: 2, points: 110, wins: 1, team: TEAM_DISPLAY.ferrari, team_id: "ferrari" },
  { position: 3, points: 92, wins: 1, team: TEAM_DISPLAY.red_bull, team_id: "red_bull" },
  { position: 4, points: 78, wins: 0, team: TEAM_DISPLAY.mercedes, team_id: "mercedes" },
  { position: 5, points: 36, wins: 0, team: TEAM_DISPLAY.aston_martin, team_id: "aston_martin" },
  { position: 6, points: 24, wins: 0, team: TEAM_DISPLAY.alpine, team_id: "alpine" },
  { position: 7, points: 19, wins: 0, team: TEAM_DISPLAY.williams, team_id: "williams" },
  { position: 8, points: 12, wins: 0, team: TEAM_DISPLAY.racing_bulls, team_id: "racing_bulls" },
  { position: 9, points: 6, wins: 0, team: TEAM_DISPLAY.kick_sauber, team_id: "kick_sauber" },
  { position: 10, points: 3, wins: 0, team: TEAM_DISPLAY.haas, team_id: "haas" },
  { position: 11, points: 0, wins: 0, team: TEAM_DISPLAY.cadillac, team_id: "cadillac" },
];

/* ============================================================ */
/* Calendar                                                     */
/* ============================================================ */

const MOCK_ROUNDS: Race[] = [
  { round: 1, season: SEASON, name: "Australian Grand Prix", country_code: "AUS", country: "Australia", locality: "Melbourne", circuit_name: "Albert Park Grand Prix Circuit", start_date: "2026-03-06", race_date: "2026-03-08", race_time: "05:00:00Z", laps: 58, distance_km: 306.124, status: "completed" },
  { round: 2, season: SEASON, name: "Chinese Grand Prix", country_code: "CHN", country: "China", locality: "Shanghai", circuit_name: "Shanghai International Circuit", start_date: "2026-03-13", race_date: "2026-03-15", race_time: "07:00:00Z", laps: 56, distance_km: 305.066, status: "completed" },
  { round: 3, season: SEASON, name: "Japanese Grand Prix", country_code: "JPN", country: "Japan", locality: "Suzuka", circuit_name: "Suzuka International Racing Course", start_date: "2026-03-27", race_date: "2026-03-29", race_time: "05:00:00Z", laps: 53, distance_km: 307.471, status: "completed" },
  {
    round: 4, season: SEASON, name: "Bahrain Grand Prix", country_code: "BHR", country: "Bahrain", locality: "Sakhir", circuit_name: "Bahrain International Circuit",
    start_date: "2026-04-10", race_date: "2026-04-12", race_time: "15:00:00Z",
    laps: 57, distance_km: 308.238,
    lap_record: { time: "1:31.447", driver: "Pedro de la Rosa", year: 2005 },
    prior_pole: { driver_name: "Max Verstappen", driver_code: "VER", team: "Red Bull Racing" },
    status: "next",
  },
  { round: 5, season: SEASON, name: "Saudi Arabian Grand Prix", country_code: "SAU", country: "Saudi Arabia", locality: "Jeddah", circuit_name: "Jeddah Corniche Circuit", start_date: "2026-04-17", race_date: "2026-04-19", race_time: "17:00:00Z", laps: 50, distance_km: 308.450, status: "upcoming" },
  { round: 6, season: SEASON, name: "Miami Grand Prix", country_code: "USA", country: "United States", locality: "Miami", circuit_name: "Miami International Autodrome", start_date: "2026-05-01", race_date: "2026-05-03", race_time: "19:30:00Z", laps: 57, distance_km: 308.326, status: "upcoming" },
  { round: 7, season: SEASON, name: "Emilia Romagna Grand Prix", country_code: "ITA", country: "Italy", locality: "Imola", circuit_name: "Autodromo Enzo e Dino Ferrari", start_date: "2026-05-15", race_date: "2026-05-17", race_time: "13:00:00Z", laps: 63, distance_km: 309.049, status: "upcoming" },
  { round: 8, season: SEASON, name: "Monaco Grand Prix", country_code: "MON", country: "Monaco", locality: "Monte Carlo", circuit_name: "Circuit de Monaco", start_date: "2026-05-22", race_date: "2026-05-24", race_time: "13:00:00Z", laps: 78, distance_km: 260.286, status: "upcoming" },
  { round: 9, season: SEASON, name: "Spanish Grand Prix", country_code: "ESP", country: "Spain", locality: "Barcelona", circuit_name: "Circuit de Barcelona-Catalunya", start_date: "2026-06-12", race_date: "2026-06-14", race_time: "13:00:00Z", laps: 66, distance_km: 308.424, status: "upcoming" },
  { round: 10, season: SEASON, name: "Canadian Grand Prix", country_code: "CAN", country: "Canada", locality: "Montréal", circuit_name: "Circuit Gilles Villeneuve", start_date: "2026-06-26", race_date: "2026-06-28", race_time: "18:00:00Z", laps: 70, distance_km: 305.270, status: "upcoming" },
  { round: 11, season: SEASON, name: "Austrian Grand Prix", country_code: "AUT", country: "Austria", locality: "Spielberg", circuit_name: "Red Bull Ring", start_date: "2026-07-03", race_date: "2026-07-05", race_time: "13:00:00Z", laps: 71, distance_km: 306.452, status: "upcoming" },
  { round: 12, season: SEASON, name: "British Grand Prix", country_code: "GBR", country: "United Kingdom", locality: "Silverstone", circuit_name: "Silverstone Circuit", start_date: "2026-07-17", race_date: "2026-07-19", race_time: "14:00:00Z", laps: 52, distance_km: 306.198, status: "upcoming" },
  { round: 13, season: SEASON, name: "Belgian Grand Prix", country_code: "BEL", country: "Belgium", locality: "Spa-Francorchamps", circuit_name: "Circuit de Spa-Francorchamps", start_date: "2026-07-24", race_date: "2026-07-26", race_time: "13:00:00Z", laps: 44, distance_km: 308.052, status: "upcoming" },
  { round: 14, season: SEASON, name: "Hungarian Grand Prix", country_code: "HUN", country: "Hungary", locality: "Budapest", circuit_name: "Hungaroring", start_date: "2026-08-21", race_date: "2026-08-23", race_time: "13:00:00Z", laps: 70, distance_km: 306.630, status: "upcoming" },
  { round: 15, season: SEASON, name: "Dutch Grand Prix", country_code: "NED", country: "Netherlands", locality: "Zandvoort", circuit_name: "Circuit Zandvoort", start_date: "2026-09-04", race_date: "2026-09-06", race_time: "13:00:00Z", laps: 72, distance_km: 306.587, status: "upcoming" },
  { round: 16, season: SEASON, name: "Italian Grand Prix", country_code: "ITA", country: "Italy", locality: "Monza", circuit_name: "Autodromo Nazionale Monza", start_date: "2026-09-11", race_date: "2026-09-13", race_time: "13:00:00Z", laps: 53, distance_km: 306.720, status: "upcoming" },
  { round: 17, season: SEASON, name: "Azerbaijan Grand Prix", country_code: "AZE", country: "Azerbaijan", locality: "Baku", circuit_name: "Baku City Circuit", start_date: "2026-09-25", race_date: "2026-09-27", race_time: "11:00:00Z", laps: 51, distance_km: 306.049, status: "upcoming" },
  { round: 18, season: SEASON, name: "Singapore Grand Prix", country_code: "SGP", country: "Singapore", locality: "Marina Bay", circuit_name: "Marina Bay Street Circuit", start_date: "2026-10-09", race_date: "2026-10-11", race_time: "12:00:00Z", laps: 62, distance_km: 306.143, status: "upcoming" },
  { round: 19, season: SEASON, name: "United States Grand Prix", country_code: "USA", country: "United States", locality: "Austin", circuit_name: "Circuit of the Americas", start_date: "2026-10-23", race_date: "2026-10-25", race_time: "19:00:00Z", laps: 56, distance_km: 308.405, status: "upcoming" },
  { round: 20, season: SEASON, name: "Mexico City Grand Prix", country_code: "MEX", country: "Mexico", locality: "Mexico City", circuit_name: "Autódromo Hermanos Rodríguez", start_date: "2026-10-30", race_date: "2026-11-01", race_time: "20:00:00Z", laps: 71, distance_km: 305.354, status: "upcoming" },
  { round: 21, season: SEASON, name: "São Paulo Grand Prix", country_code: "BRA", country: "Brazil", locality: "São Paulo", circuit_name: "Autódromo José Carlos Pace", start_date: "2026-11-06", race_date: "2026-11-08", race_time: "17:00:00Z", laps: 71, distance_km: 305.879, status: "upcoming" },
  { round: 22, season: SEASON, name: "Las Vegas Grand Prix", country_code: "USA", country: "United States", locality: "Las Vegas", circuit_name: "Las Vegas Strip Circuit", start_date: "2026-11-19", race_date: "2026-11-21", race_time: "06:00:00Z", laps: 50, distance_km: 309.958, status: "upcoming" },
  { round: 23, season: SEASON, name: "Abu Dhabi Grand Prix", country_code: "UAE", country: "United Arab Emirates", locality: "Yas Marina", circuit_name: "Yas Marina Circuit", start_date: "2026-12-04", race_date: "2026-12-06", race_time: "13:00:00Z", laps: 58, distance_km: 306.183, status: "upcoming" },
];

export const MOCK_CALENDAR: CalendarResponse = {
  season: SEASON,
  rounds: MOCK_ROUNDS,
  next_round: 4,
};

/* ============================================================ */
/* Predictions                                                  */
/* ============================================================ */

interface Seed {
  code: string;
  name: string;
  team: string;
  team_id: TeamId;
  strength: number;
}

const SEEDS: Seed[] = [
  { code: "NOR", name: "Lando Norris", team: "McLaren", team_id: "mclaren", strength: 9.5 },
  { code: "PIA", name: "Oscar Piastri", team: "McLaren", team_id: "mclaren", strength: 9.1 },
  { code: "VER", name: "Max Verstappen", team: "Red Bull Racing", team_id: "red_bull", strength: 9.3 },
  { code: "LEC", name: "Charles Leclerc", team: "Ferrari", team_id: "ferrari", strength: 8.7 },
  { code: "HAM", name: "Lewis Hamilton", team: "Ferrari", team_id: "ferrari", strength: 8.4 },
  { code: "RUS", name: "George Russell", team: "Mercedes", team_id: "mercedes", strength: 8.2 },
  { code: "ANT", name: "Andrea Kimi Antonelli", team: "Mercedes", team_id: "mercedes", strength: 7.5 },
  { code: "ALO", name: "Fernando Alonso", team: "Aston Martin", team_id: "aston_martin", strength: 6.8 },
  { code: "STR", name: "Lance Stroll", team: "Aston Martin", team_id: "aston_martin", strength: 6.0 },
  { code: "GAS", name: "Pierre Gasly", team: "Alpine", team_id: "alpine", strength: 6.4 },
  { code: "DOO", name: "Jack Doohan", team: "Alpine", team_id: "alpine", strength: 5.6 },
  { code: "SAI", name: "Carlos Sainz", team: "Williams", team_id: "williams", strength: 7.0 },
  { code: "ALB", name: "Alex Albon", team: "Williams", team_id: "williams", strength: 6.2 },
  { code: "TSU", name: "Yuki Tsunoda", team: "Racing Bulls", team_id: "racing_bulls", strength: 6.1 },
  { code: "LAW", name: "Liam Lawson", team: "Racing Bulls", team_id: "racing_bulls", strength: 5.9 },
  { code: "HUL", name: "Nico Hülkenberg", team: "Kick Sauber", team_id: "kick_sauber", strength: 5.7 },
  { code: "BOR", name: "Gabriel Bortoleto", team: "Kick Sauber", team_id: "kick_sauber", strength: 5.0 },
  { code: "BEA", name: "Oliver Bearman", team: "Haas", team_id: "haas", strength: 5.8 },
  { code: "OCO", name: "Esteban Ocon", team: "Haas", team_id: "haas", strength: 5.5 },
  { code: "PER", name: "Sergio Pérez", team: "Cadillac", team_id: "cadillac", strength: 5.4 },
];

function buildDistribution(rank: number): number[] {
  const dist = new Array<number>(20);
  let sum = 0;
  for (let pos = 0; pos < 20; pos++) {
    const d = Math.abs(pos - rank);
    const w = Math.exp(-Math.pow(d, 1.4) / 2.6);
    dist[pos] = w;
    sum += w;
  }
  for (let i = 0; i < 20; i++) dist[i] = dist[i] / sum;
  return dist;
}

export function buildMockPredictions(): PredictionResponse {
  const ranked = [...SEEDS].sort((a, b) => b.strength - a.strength);
  const drivers: DriverPrediction[] = ranked.map((s, idx) => {
    const distribution = buildDistribution(idx);
    return {
      driver_code: s.code,
      driver_name: s.name,
      team: s.team,
      team_id: s.team_id,
      expected_position: idx + 1,
      win_probability: distribution[0],
      podium_probability: distribution[0] + distribution[1] + distribution[2],
      points_probability: distribution.slice(0, 10).reduce((a, b) => a + b, 0),
      position_distribution: distribution,
    };
  });

  const top = drivers[0];
  const pole = drivers[1]; // pole sometimes differs from race winner
  const generatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  return {
    season: SEASON,
    round: 4,
    race_name: "Bahrain Grand Prix",
    generated_at: generatedAt,
    model_version: "preq-v1.2",
    n_simulations: 10_000,
    pre_quali: {
      predicted_pole: {
        driver_code: pole.driver_code,
        driver_name: pole.driver_name,
        team: pole.team,
        team_id: pole.team_id,
        confidence: 0.34,
      },
      predicted_winner: top,
    },
    post_quali: null,
    drivers,
  };
}

/* ============================================================ */
/* Paddock Intel                                                */
/* ============================================================ */

const PODIUMS: Record<number, RaceResult[]> = {
  1: [
    { position: 1, driver_code: "VER", driver_name: "Max Verstappen", team: "Red Bull Racing", team_id: "red_bull", gap: "—" },
    { position: 2, driver_code: "NOR", driver_name: "Lando Norris", team: "McLaren", team_id: "mclaren", gap: "+2.413" },
    { position: 3, driver_code: "LEC", driver_name: "Charles Leclerc", team: "Ferrari", team_id: "ferrari", gap: "+5.998" },
  ],
  2: [
    { position: 1, driver_code: "NOR", driver_name: "Lando Norris", team: "McLaren", team_id: "mclaren", gap: "—" },
    { position: 2, driver_code: "PIA", driver_name: "Oscar Piastri", team: "McLaren", team_id: "mclaren", gap: "+1.927" },
    { position: 3, driver_code: "RUS", driver_name: "George Russell", team: "Mercedes", team_id: "mercedes", gap: "+8.044" },
  ],
  3: [
    { position: 1, driver_code: "NOR", driver_name: "Lando Norris", team: "McLaren", team_id: "mclaren", gap: "—" },
    { position: 2, driver_code: "VER", driver_name: "Max Verstappen", team: "Red Bull Racing", team_id: "red_bull", gap: "+4.812" },
    { position: 3, driver_code: "LEC", driver_name: "Charles Leclerc", team: "Ferrari", team_id: "ferrari", gap: "+11.207" },
  ],
};

const STORIES: Record<number, { tags: string[]; story: string; race_name: string }> = {
  1: {
    race_name: "Australian Grand Prix",
    tags: ["DEBUT", "SEASON OPENER"],
    story:
      "Lights out on a new era. Verstappen converted pole into a controlled win as the field sorted out the active-aero rules in real time. Antonelli's first laps in F1 ended in points; Cadillac's debut saw both cars finish — the basement of the order, but a finish.",
  },
  2: {
    race_name: "Chinese Grand Prix",
    tags: ["1–2 FINISH", "CALENDAR"],
    story:
      "Papaya in formation. Piastri held off Norris off the line, then ceded position on strategy — McLaren's first 1–2 of the new regulations. Russell stole the third step from a fading Red Bull as the Shanghai resurfacing rewarded long-run tyre management over single-lap pace.",
  },
  3: {
    race_name: "Japanese Grand Prix",
    tags: ["ENGINE WAR", "RAIN"],
    story:
      "McLaren turned a damp Suzuka into a clinic — Norris ran a one-stop while everyone else burned tyres trying to catch him. Verstappen hung on by sheer hands and a Honda farewell setup; Leclerc rescued a podium that masked a bruising weekend for Ferrari's race pace.",
  },
};

export function buildMockIntel(round: number): PaddockIntel | null {
  const podium = PODIUMS[round];
  const meta = STORIES[round];
  if (!podium || !meta) {
    // Fall back to most recent
    const fallback = 3;
    if (round === fallback) return null;
    return buildMockIntel(fallback);
  }
  return {
    round,
    race_name: meta.race_name,
    podium,
    tags: meta.tags.map((label) => ({ label })),
    story: meta.story,
  };
}
