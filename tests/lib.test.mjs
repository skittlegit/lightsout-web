import assert from "node:assert/strict";
import { test } from "node:test";
import { isClassified, raceRecap } from "../lib/recap.ts";

const result = (position, grid, status) => ({
  position: String(position), grid: String(grid), status,
  Driver: { familyName: `D${position}` }, Constructor: {},
});

test("laps-down finishers count as classified in both status formats", () => {
  for (const status of ["Finished", "Lapped", "+1 Lap", "+2 Laps"]) assert.equal(isClassified(status), true, status);
  for (const status of ["Retired", "Did not start", "Disqualified"]) assert.equal(isClassified(status), false, status);
});

test("recap does not count lapped cars as DNFs and lets them be biggest mover", () => {
  const recap = raceRecap([result(1, 1, "Finished"), result(2, 18, "Lapped"), result(3, 2, "Retired")]);
  assert.equal(recap.dnfs, 1);
  assert.equal(recap.classified, 2);
  assert.equal(recap.biggestMover.result.Driver.familyName, "D2");
});

test("ics is a timed UTC event when the race start is known, all-day otherwise", async () => {
  const { buildRaceIcs } = await import("../lib/ics.ts");
  const race = { season: 2026, round: 17, race_name: "Singapore Grand Prix", circuit: "Marina Bay", country: "Singapore", race_date: "2026-10-11" };
  const timed = buildRaceIcs({ ...race, race_time: "12:00:00Z" });
  assert.match(timed, /DTSTART:20261011T120000Z\r\nDTEND:20261011T140000Z/);
  assert.match(buildRaceIcs(race), /DTSTART;VALUE=DATE:20261011\r\nDTEND;VALUE=DATE:20261012/);
});

test("lapped finishers show laps down instead of a stray seconds gap", async () => {
  const { finishGap } = await import("../lib/recap.ts");
  const row = (laps, status, time) => ({ laps: String(laps), status, ...(time ? { Time: { time } } : {}) });
  assert.equal(finishGap(row(68, "Finished", "+10.768"), 68), "+10.768");
  assert.equal(finishGap(row(67, "Lapped", "+5.033"), 68), "+1 Lap");
  assert.equal(finishGap(row(64, "Lapped"), 68), "+4 Laps");
  assert.equal(finishGap(row(38, "Retired"), 68), "Retired");
});
