import { getCalendar, getConstructorStandings, getDriverStandings } from "@/lib/api";
import { teamSlug } from "@/lib/slug";
import { teamShort } from "@/lib/format";
import CommandPalette, { type PaletteItem } from "./CommandPalette";

export default async function CommandPaletteServer() {
  const [drivers, constructors, cal] = await Promise.all([
    getDriverStandings(),
    getConstructorStandings(),
    getCalendar(),
  ]);

  const items: PaletteItem[] = [
    ...drivers.map((d) => ({
      title: d.driver_name,
      subtitle: `${d.driver_code} · ${teamShort(d.team)} · P${d.position} · ${d.points} pts`,
      haystack: `${d.driver_name} ${d.driver_code} ${d.team} driver`,
      href: `/drivers/${d.driver_code.toLowerCase()}`,
      group: "Drivers" as const,
    })),
    ...constructors.map((c) => ({
      title: teamShort(c.team),
      subtitle: `Constructor · P${c.position} · ${c.points} pts`,
      haystack: `${c.team} ${teamShort(c.team)} constructor team`,
      href: `/constructors/${teamSlug(c.team)}`,
      group: "Constructors" as const,
    })),
    ...cal.races.map((r) => ({
      title: r.race_name,
      subtitle: `Round ${String(r.round).padStart(2, "0")} · ${r.country} · ${
        r.is_completed ? "Completed" : r.is_next ? "Up Next" : "Scheduled"
      }`,
      haystack: `${r.race_name} ${r.country} ${r.circuit} round ${r.round} race`,
      href: `/races/${r.round}`,
      group: "Races" as const,
    })),
  ];

  return <CommandPalette items={items} />;
}
