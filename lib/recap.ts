/**
 * Race-recap summary derived from a round's Jolpica results.
 * Pure + deterministic so it renders on the server.
 */

import type { JolpicaRaceResult } from "./jolpica";

function isClassified(status: string): boolean {
  return status === "Finished" || /^\+\d+ Lap/.test(status);
}

export interface RaceRecap {
  winner: JolpicaRaceResult | null;
  pole: JolpicaRaceResult | null;
  fastestLap: JolpicaRaceResult | null;
  fastestLapTime: string | null;
  /** Most places gained vs starting grid among classified finishers. */
  biggestMover: { result: JolpicaRaceResult; gained: number } | null;
  dnfs: number;
  classified: number;
  /** P2's gap to the winner, e.g. "+5.231" (null if lapped / unavailable). */
  margin: string | null;
}

export function raceRecap(results: JolpicaRaceResult[]): RaceRecap | null {
  if (!results.length) return null;

  const byFinish = [...results].sort(
    (a, b) => Number(a.position) - Number(b.position)
  );

  let dnfs = 0;
  let biggestMover: RaceRecap["biggestMover"] = null;

  for (const r of results) {
    if (!isClassified(r.status)) {
      dnfs += 1;
      continue;
    }
    const grid = Number(r.grid);
    const pos = Number(r.position);
    if (grid > 0 && Number.isFinite(pos)) {
      const gained = grid - pos;
      if (!biggestMover || gained > biggestMover.gained) {
        biggestMover = { result: r, gained };
      }
    }
  }

  const fastestLap = results.find((r) => r.FastestLap?.rank === "1") ?? null;

  return {
    winner: byFinish[0] ?? null,
    pole: results.find((r) => Number(r.grid) === 1) ?? null,
    fastestLap,
    fastestLapTime: fastestLap?.FastestLap?.Time.time ?? null,
    biggestMover: biggestMover && biggestMover.gained > 0 ? biggestMover : null,
    dnfs,
    classified: results.length - dnfs,
    margin: byFinish[1]?.Time?.time ?? null,
  };
}

/** Grid → finish delta for a single result; null when not meaningfully comparable. */
export function gridDelta(result: JolpicaRaceResult): number | null {
  const grid = Number(result.grid);
  const pos = Number(result.position);
  if (!(grid > 0) || !Number.isFinite(pos)) return null;
  return grid - pos;
}
