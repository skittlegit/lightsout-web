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
