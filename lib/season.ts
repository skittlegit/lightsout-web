/**
 * Season-level derivations from Jolpica classifications: championship points
 * progression and per-round podiums. Pure + deterministic (server-rendered).
 */

import type { JolpicaRace, JolpicaRaceResult } from "./jolpica";

export interface ProgressionSeries {
  code: string;
  name: string;
  team: string;
  /** Cumulative points after each completed round, aligned with `rounds`. */
  points: number[];
}

export interface Progression {
  rounds: number[];
  series: ProgressionSeries[];
}

function driverCode(r: JolpicaRaceResult): string {
  return r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase();
}

/**
 * Cumulative points per driver after each round, Grand Prix plus sprint.
 * Returns the `top` drivers by final total; drivers who missed a round carry
 * their previous total forward.
 */
export function pointsProgression(
  races: JolpicaRace[],
  sprints: JolpicaRace[],
  top = 6,
): Progression {
  const sprintByRound = new Map(sprints.map((s) => [Number(s.round), s.SprintResults ?? []]));
  const rounds = races.map((r) => Number(r.round)).sort((a, b) => a - b);
  const totals = new Map<string, { name: string; team: string; total: number; points: number[] }>();

  rounds.forEach((round, i) => {
    const race = races.find((r) => Number(r.round) === round);
    for (const r of [...(race?.Results ?? []), ...(sprintByRound.get(round) ?? [])]) {
      const code = driverCode(r);
      const entry = totals.get(code) ?? {
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        team: r.Constructor.name,
        total: 0,
        points: Array(i).fill(0),
      };
      entry.total += Number(r.points) || 0;
      entry.team = r.Constructor.name; // latest seat
      totals.set(code, entry);
    }
    // Close the round for everyone, including drivers who didn't start it.
    for (const entry of totals.values()) {
      while (entry.points.length < i) entry.points.push(entry.total);
      entry.points[i] = entry.total;
    }
  });

  const series = [...totals.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, top)
    .map(([code, e]) => ({ code, name: e.name, team: e.team, points: e.points }));
  return { rounds, series };
}

/** Top three finishers per round, for calendar winner columns. */
export function podiumsByRound(races: JolpicaRace[]): Map<number, JolpicaRaceResult[]> {
  return new Map(
    races.map((race) => [
      Number(race.round),
      [...(race.Results ?? [])]
        .sort((a, b) => Number(a.position) - Number(b.position))
        .slice(0, 3),
    ]),
  );
}
