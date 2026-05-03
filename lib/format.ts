import type { TeamId } from "./types";

/* ------------------------------------------------------------------ */
/* Numeric formatters                                                 */
/* ------------------------------------------------------------------ */

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function pct(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

export function pctShort(p: number): string {
  return `${Math.round(p * 100)}%`;
}

/* ------------------------------------------------------------------ */
/* Editorial helpers                                                  */
/* ------------------------------------------------------------------ */

/** "Australian Grand Prix" -> { head: "Australian", tail: "Grand Prix" } */
export function splitRaceName(name: string): { head: string; tail: string } {
  const m = name.match(/^(.*?)\s+(Grand Prix|GP)$/i);
  if (m) return { head: m[1], tail: m[2] };
  return { head: name, tail: "" };
}

/** "Mar 14" or "Mar 14–16" — backend only gives one date so default = single day. */
export function formatRaceDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(d);
  return `${month} ${d.getUTCDate()}`;
}

export function formatRaceFullDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function timeGreeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 0 && h < 5) return "Late Lap";
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

/** "Andrea Kimi Antonelli" -> "K. Antonelli", "Max Verstappen" -> "M. Verstappen" */
export function abbreviateName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  const last = parts[parts.length - 1];
  const firstInitialSource = parts.length >= 3 ? parts[1] : parts[0];
  return `${firstInitialSource.charAt(0)}. ${last}`;
}

/* ------------------------------------------------------------------ */
/* Team display-string -> id mapping                                  */
/* ------------------------------------------------------------------ */

/** Backend gives team display strings. Map to a stable TeamId for color/branding. */
export function teamId(team: string): TeamId {
  const t = team.toLowerCase();
  if (t.includes("mercedes")) return "mercedes";
  if (t.includes("ferrari")) return "ferrari";
  if (t.includes("red bull")) return "red_bull";
  if (t.includes("mclaren")) return "mclaren";
  if (t.includes("aston")) return "aston_martin";
  if (t.includes("alpine")) return "alpine";
  if (t.includes("williams")) return "williams";
  if (t.includes("rb ") || t === "rb" || t.includes("racing bulls")) return "racing_bulls";
  if (t.includes("audi") || t.includes("sauber") || t.includes("kick")) return "audi";
  if (t.includes("haas")) return "haas";
  if (t.includes("cadillac")) return "cadillac";
  return "haas";
}

const TEAM_HEX: Record<TeamId, string> = {
  mercedes: "#27F4D2",
  ferrari: "#E80020",
  red_bull: "#3671C6",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#FF87BC",
  williams: "#1868DB",
  racing_bulls: "#6692FF",
  audi: "#52E252",
  haas: "#9C9FA2",
  cadillac: "#C9B47B",
};

/** Accepts either a TeamId or a backend team display string. */
export function teamColor(idOrName: TeamId | string): string {
  if ((TEAM_HEX as Record<string, string>)[idOrName]) {
    return TEAM_HEX[idOrName as TeamId];
  }
  return TEAM_HEX[teamId(idOrName)];
}

/** Short team display label that fits tight rows. */
export function teamShort(team: string): string {
  const id = teamId(team);
  return {
    mercedes: "Mercedes",
    ferrari: "Ferrari",
    red_bull: "Red Bull",
    mclaren: "McLaren",
    aston_martin: "Aston Martin",
    alpine: "Alpine",
    williams: "Williams",
    racing_bulls: "Racing Bulls",
    audi: "Audi",
    haas: "Haas",
    cadillac: "Cadillac",
  }[id];
}

/* ------------------------------------------------------------------ */
/* Country display                                                    */
/* ------------------------------------------------------------------ */

const COUNTRY_CODES: Record<string, string> = {
  Australia: "AUS",
  China: "CHN",
  Japan: "JPN",
  Bahrain: "BHR",
  "Saudi Arabia": "KSA",
  USA: "USA",
  "United States": "USA",
  Canada: "CAN",
  Monaco: "MON",
  Spain: "ESP",
  Austria: "AUT",
  UK: "GBR",
  "United Kingdom": "GBR",
  Britain: "GBR",
  Belgium: "BEL",
  Hungary: "HUN",
  Netherlands: "NED",
  Italy: "ITA",
  Azerbaijan: "AZE",
  Singapore: "SGP",
  Mexico: "MEX",
  Brazil: "BRA",
  UAE: "UAE",
  "United Arab Emirates": "UAE",
  Qatar: "QAT",
};

export function countryCode(country: string): string {
  return COUNTRY_CODES[country] ?? country.slice(0, 3).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Heatmap color (gamma-corrected paper -> F1 deep red)               */
/* ------------------------------------------------------------------ */

export function heatmapColor(p: number): string {
  const clamped = Math.max(0, Math.min(1, p));
  const t = Math.pow(clamped, 0.45);
  const r = Math.round(0xfa + (0xc2 - 0xfa) * t);
  const g = Math.round(0xf7 + (0x05 - 0xf7) * t);
  const b = Math.round(0xf2 + (0x00 - 0xf2) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function heatmapTextColor(p: number): string {
  return p >= 0.35 ? "#FAF7F2" : "#0E0E0E";
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function relativeTimeUpper(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  const diffMs = now.getTime() - t;
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 45) return "JUST NOW";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} MIN AGO`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} HR${hr === 1 ? "" : "S"} AGO`;
  const day = Math.floor(hr / 24);
  return `${day} DAY${day === 1 ? "" : "S"} AGO`;
}
