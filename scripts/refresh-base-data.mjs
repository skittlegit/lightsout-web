import { mkdir, writeFile } from "node:fs/promises";

const season = process.env.NEXT_PUBLIC_SEASON ?? "2026";
const base = (process.env.NEXT_PUBLIC_API_URL ?? "https://lightsout-api.onrender.com/api").replace(/\/$/, "");
const [calendar, drivers, constructors] = await Promise.all(
  ["/calendar", "/standings/drivers", "/standings/constructors"].map(async (path) => {
    const response = await fetch(`${base}${path}?season=${season}`, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }),
);
if (!calendar.races?.length || !drivers.length || !constructors.length) {
  throw new Error("Incomplete base data; keeping the existing snapshot.");
}
const directory = new URL("../lib/data/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("base-data.json", directory), JSON.stringify({
  season: Number(season),
  fetched_at: new Date().toISOString(),
  source: base,
  calendar,
  drivers,
  constructors,
}, null, 2) + "\n");
console.log(`Updated season ${season}: ${calendar.races.length} races, ${drivers.length} drivers, ${constructors.length} constructors`);
