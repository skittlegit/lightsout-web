import Ticker from "./Ticker";
import {
  getCalendar,
  getDriverStandings,
  pickLastCompleted,
  pickNextRace,
} from "@/lib/api";
import { teamShort } from "@/lib/format";

/** Server wrapper — pulls the freshest data and feeds the marquee. */
export default async function TickerSection() {
  const [cal, drivers] = await Promise.all([
    getCalendar(),
    getDriverStandings().catch(() => []),
  ]);

  const next = pickNextRace(cal.races);
  const last = pickLastCompleted(cal.races);
  const leader = drivers[0];
  const second = drivers[1];

  const items: { text: string; accent?: boolean }[] = [];

  items.push({ text: `F1 ${cal.season}`, accent: true });

  if (next) {
    const round = String(next.round).padStart(2, "0");
    items.push({ text: `Up Next · R${round} · ${next.race_name}`, accent: true });
    items.push({ text: `${next.circuit} · ${next.country}` });
  }

  if (leader) {
    items.push({
      text: `Championship · ${leader.driver_name} (${teamShort(leader.team)}) · ${leader.points} pts`,
    });
    if (second) {
      const gap = leader.points - second.points;
      items.push({ text: `Gap to P2 · +${gap} pts` });
    }
  }

  if (last) {
    items.push({ text: `Last Race · R${String(last.round).padStart(2, "0")} ${last.race_name} — Complete` });
  }

  items.push({ text: "Lights Out · Lights Out · Lights Out", accent: true });

  return <Ticker items={items} />;
}
