import type { Race } from "./types";

/**
 * iCalendar (.ics) generation for a single race.
 *
 * The backend only gives a race date (no session times), so each event is an
 * all-day entry on race day — honest to the data we have. Importable into
 * Google / Apple / Outlook calendars.
 */

function ymd(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "");
}

/** DTEND for an all-day VEVENT is exclusive, so it's race day + 1. */
function ymdPlusOne(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`;
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildRaceIcs(race: Race): string {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const location = esc([race.circuit, race.country].filter(Boolean).join(", "));
  const description = esc(
    `Round ${race.round} of the ${race.season} Formula 1 season.` +
      (race.has_sprint ? " Sprint weekend." : "")
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LightsOut//F1 Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:f1-${race.season}-r${race.round}@lightsout`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(race.race_date)}`,
    `DTEND;VALUE=DATE:${ymdPlusOne(race.race_date)}`,
    `SUMMARY:${esc(`🏁 ${race.race_name}`)}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Builds the .ics in-memory and triggers a browser download. */
export function downloadRaceIcs(race: Race): void {
  const blob = new Blob([buildRaceIcs(race)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = race.country.toLowerCase().replace(/\s+/g, "-");
  a.href = url;
  a.download = `f1-${race.season}-r${String(race.round).padStart(2, "0")}-${slug}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
