import type { TeamId } from "./types";

/* ------------------------------------------------------------------ */
/* Time / numeric formatters                                          */
/* ------------------------------------------------------------------ */

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function pct(p: number): string {
  // 0..1 -> "12.3%"
  return `${(p * 100).toFixed(1)}%`;
}

export function pctShort(p: number): string {
  // 0..1 -> "12%"
  return `${Math.round(p * 100)}%`;
}

/* ------------------------------------------------------------------ */
/* Editorial helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Splits "Australian Grand Prix" -> { head: "Australian", tail: "Grand Prix" }
 * "Las Vegas GP"                  -> { head: "Las Vegas", tail: "GP" }
 * Falls back to { head: full, tail: "" } if no match.
 */
export function splitRaceName(name: string): { head: string; tail: string } {
  const match = name.match(/^(.*?)\s+(Grand Prix|GP)$/i);
  if (match) return { head: match[1], tail: match[2] };
  return { head: name, tail: "" };
}

/** "Mar 14–16" style range, locale-stable. */
export function formatRaceDate(startISO: string, endISO: string): string {
  const start = new Date(startISO + (startISO.length === 10 ? "T00:00:00Z" : ""));
  const end = new Date(endISO + (endISO.length === 10 ? "T00:00:00Z" : ""));
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = monthFmt.format(start);
  const endMonth = monthFmt.format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  if (startMonth === endMonth) return `${startMonth} ${startDay}–${endDay}`;
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
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

/** Time-of-day greeting in viewer's local time. Pass a Date to be deterministic on server. */
export function timeGreeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 0 && h < 5) return "Late Lap";
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Abbreviate a driver name for tight rows.
 * "Andrea Kimi Antonelli" -> "K. Antonelli"
 * "Max Verstappen"        -> "M. Verstappen"
 */
export function abbreviateName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  const last = parts[parts.length - 1];
  const firstInitialSource = parts.length >= 3 ? parts[1] : parts[0];
  return `${firstInitialSource.charAt(0)}. ${last}`;
}

/* ------------------------------------------------------------------ */
/* Team color lookup                                                  */
/* ------------------------------------------------------------------ */

const TEAM_HEX: Record<TeamId, string> = {
  mercedes: "#27F4D2",
  ferrari: "#E80020",
  red_bull: "#3671C6",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#0093CC",
  williams: "#64C4FF",
  racing_bulls: "#6692FF",
  kick_sauber: "#52E252",
  haas: "#B6BABD",
  cadillac: "#FFD700",
};

export function teamColor(id: TeamId | string): string {
  return TEAM_HEX[id as TeamId] ?? "#6B6862";
}

/* ------------------------------------------------------------------ */
/* Heatmap color (gamma-corrected white -> F1 red)                     */
/* ------------------------------------------------------------------ */

/**
 * Map probability 0..1 to an RGB color from paper -> F1 red,
 * with gamma correction so sub-5% values still register visually.
 */
export function heatmapColor(p: number): string {
  const clamped = Math.max(0, Math.min(1, p));
  // Gamma <1 brightens low values
  const t = Math.pow(clamped, 0.45);
  // From paper #FAF7F2 -> f1Deep #C20500
  const r = Math.round(0xfa + (0xc2 - 0xfa) * t);
  const g = Math.round(0xf7 + (0x05 - 0xf7) * t);
  const b = Math.round(0xf2 + (0x00 - 0xf2) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function heatmapTextColor(p: number): string {
  // Switch to paper text when cells get dark
  return p >= 0.35 ? "#FAF7F2" : "#0E0E0E";
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

/** "2 HRS AGO", "12 MIN AGO", "JUST NOW" — UPPER-cased for eyebrows. */
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
