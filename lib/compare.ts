/**
 * Head-to-head math for two drivers, derived from their Jolpica season
 * results (per-race finishing position, grid, points, status).
 *
 * Pure + deterministic so it can be unit-reasoned and rendered on the server.
 */

import type { JolpicaRace } from "./jolpica";

/** Ergast/Jolpica "classified" statuses: a clean finish or laps-down. */
function isFinished(status: string): boolean {
  return status === "Finished" || /^\+\d+ Lap/.test(status);
}

export interface DriverSeasonStats {
  rounds: number;
  wins: number;
  podiums: number;
  pointsFinishes: number;
  bestFinish: number | null;
  avgFinish: number | null;
  avgGrid: number | null;
  dnfs: number;
  pointsFromResults: number;
}

export function seasonStats(races: JolpicaRace[]): DriverSeasonStats {
  let wins = 0;
  let podiums = 0;
  let pointsFinishes = 0;
  let dnfs = 0;
  let pointsFromResults = 0;
  let bestFinish: number | null = null;
  const finishes: number[] = [];
  const grids: number[] = [];

  for (const race of races) {
    const res = race.Results?.[0];
    if (!res) continue;
    const pos = Number(res.position);
    const grid = Number(res.grid);
    const pts = Number(res.points) || 0;

    pointsFromResults += pts;
    if (pts > 0) pointsFinishes += 1;
    if (Number.isFinite(grid) && grid > 0) grids.push(grid);
    if (!isFinished(res.status)) dnfs += 1;

    if (Number.isFinite(pos)) {
      finishes.push(pos);
      if (bestFinish === null || pos < bestFinish) bestFinish = pos;
      if (pos === 1) wins += 1;
      if (pos <= 3) podiums += 1;
    }
  }

  const mean = (arr: number[]) =>
    arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;

  return {
    rounds: races.length,
    wins,
    podiums,
    pointsFinishes,
    bestFinish,
    avgFinish: mean(finishes),
    avgGrid: mean(grids),
    dnfs,
    pointsFromResults,
  };
}

export interface H2HRow {
  round: number;
  raceName: string;
  aPos: number | null;
  bPos: number | null;
  aText: string | null;
  bText: string | null;
  aDnf: boolean;
  bDnf: boolean;
  winner: "a" | "b" | null;
}

export interface H2HResult {
  rows: H2HRow[];
  /** Times each driver finished ahead across rounds they both contested. */
  raceWinsA: number;
  raceWinsB: number;
  /** Same idea for grid position (a proxy for qualifying). */
  qualWinsA: number;
  qualWinsB: number;
}

export function headToHead(aRaces: JolpicaRace[], bRaces: JolpicaRace[]): H2HResult {
  const bByRound = new Map<number, JolpicaRace>();
  for (const r of bRaces) bByRound.set(Number(r.round), r);

  const rows: H2HRow[] = [];
  let raceWinsA = 0;
  let raceWinsB = 0;
  let qualWinsA = 0;
  let qualWinsB = 0;

  for (const ra of aRaces) {
    const round = Number(ra.round);
    const rb = bByRound.get(round);
    if (!rb) continue;
    const resA = ra.Results?.[0];
    const resB = rb.Results?.[0];
    if (!resA || !resB) continue;

    const aPos = Number(resA.position);
    const bPos = Number(resB.position);
    const aGrid = Number(resA.grid);
    const bGrid = Number(resB.grid);

    let winner: "a" | "b" | null = null;
    if (Number.isFinite(aPos) && Number.isFinite(bPos)) {
      winner = aPos < bPos ? "a" : bPos < aPos ? "b" : null;
    }
    if (winner === "a") raceWinsA += 1;
    else if (winner === "b") raceWinsB += 1;

    if (aGrid > 0 && bGrid > 0) {
      if (aGrid < bGrid) qualWinsA += 1;
      else if (bGrid < aGrid) qualWinsB += 1;
    }

    rows.push({
      round,
      raceName: ra.raceName,
      aPos: Number.isFinite(aPos) ? aPos : null,
      bPos: Number.isFinite(bPos) ? bPos : null,
      aText: resA.positionText ?? null,
      bText: resB.positionText ?? null,
      aDnf: !isFinished(resA.status),
      bDnf: !isFinished(resB.status),
      winner,
    });
  }

  rows.sort((x, y) => x.round - y.round);
  return { rows, raceWinsA, raceWinsB, qualWinsA, qualWinsB };
}
