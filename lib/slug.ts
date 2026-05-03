/**
 * Slug helpers — translate between our backend's display strings,
 * driver/team codes, and Jolpica's canonical IDs.
 */

import { teamId } from "./format";
import type { TeamId } from "./types";

/* ---------------- Driver codes <-> jolpica driverId ---------------- */

/**
 * Map a 3-letter driver code (from our backend) to Jolpica driverId.
 * Built statically for the 2026 grid; falls back to lowercased family name guess.
 */
const DRIVER_CODE_TO_ID: Record<string, string> = {
  ANT: "antonelli",
  RUS: "russell",
  LEC: "leclerc",
  HAM: "hamilton",
  NOR: "norris",
  PIA: "piastri",
  BEA: "bearman",
  GAS: "gasly",
  VER: "max_verstappen",
  LAW: "lawson",
  LIN: "lindblad",
  HAD: "hadjar",
  BOR: "bortoleto",
  SAI: "sainz",
  OCO: "ocon",
  COL: "colapinto",
  HUL: "hulkenberg",
  ALB: "albon",
  BOT: "bottas",
  PER: "perez",
  ALO: "alonso",
  STR: "stroll",
  TSU: "tsunoda",
  DOO: "doohan",
};

export function driverIdFromCode(code: string): string | null {
  return DRIVER_CODE_TO_ID[code.toUpperCase()] ?? null;
}

export function driverCodeFromId(id: string): string | null {
  const up = Object.entries(DRIVER_CODE_TO_ID).find(
    ([, v]) => v.toLowerCase() === id.toLowerCase()
  );
  return up?.[0] ?? null;
}

/* ---------------- Team display string -> jolpica constructorId ----- */

const TEAM_TO_CONSTRUCTOR_ID: Partial<Record<TeamId, string>> = {
  mercedes: "mercedes",
  ferrari: "ferrari",
  red_bull: "red_bull",
  mclaren: "mclaren",
  aston_martin: "aston_martin",
  alpine: "alpine",
  williams: "williams",
  racing_bulls: "rb",
  audi: "audi",
  haas: "haas",
  cadillac: "cadillac",
};

export function constructorIdFromTeam(team: string): string {
  const id = teamId(team);
  return TEAM_TO_CONSTRUCTOR_ID[id] ?? id;
}

/** Slug used in our URLs (e.g. /constructors/red-bull). Stable across data sources. */
export function teamSlug(team: string): string {
  return teamId(team).replace(/_/g, "-");
}

export function teamFromSlug(slug: string): TeamId {
  return slug.replace(/-/g, "_") as TeamId;
}
