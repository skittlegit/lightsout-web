import type { Metadata, Route } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import DriverName from "@/app/components/DriverName";
import SectionTitle, { PageHeader } from "@/app/components/SectionTitle";
import { TableCard } from "@/app/components/ui";
import CompareSelectors, {
  type CompareOption,
} from "@/app/components/CompareSelectors";
import { getDriverStandings } from "@/lib/api";
import { getDriverResults, getDrivers } from "@/lib/jolpica";
import { driverIdFromCode } from "@/lib/slug";
import { abbreviateName, inkOf, teamColor, teamShort } from "@/lib/format";
import { seasonStats, headToHead } from "@/lib/compare";
import type { DriverStanding } from "@/lib/types";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Head to Head · Drivers",
  description:
    "Compare any two drivers side by side — points, podiums, average finish, and race-by-race results.",
};

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type Dir = "higher" | "lower";

interface StatRow {
  label: string;
  aStr: string;
  bStr: string;
  better: "a" | "b" | "tie";
}

function buildRow(
  label: string,
  a: number | null,
  b: number | null,
  dir: Dir,
  fmt: (n: number) => string
): StatRow {
  let better: "a" | "b" | "tie" = "tie";
  if (a != null && b != null) {
    if (a === b) better = "tie";
    else if (dir === "higher") better = a > b ? "a" : "b";
    else better = a < b ? "a" : "b";
  } else if (a != null) better = "a";
  else if (b != null) better = "b";
  return {
    label,
    aStr: a == null ? "—" : fmt(a),
    bStr: b == null ? "—" : fmt(b),
    better,
  };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const standings = await getDriverStandings();

  const byCode = new Map<string, DriverStanding>(
    standings.map((d) => [d.driver_code, d])
  );

  const valid = (c?: string) => {
    const up = c?.toUpperCase();
    return up && byCode.has(up) ? up : null;
  };

  const codeA = valid(first(sp.a)) ?? standings[0]?.driver_code ?? "";
  let codeB =
    valid(first(sp.b)) ?? standings[1]?.driver_code ?? standings[0]?.driver_code ?? "";
  if (codeB === codeA) {
    codeB = standings.find((d) => d.driver_code !== codeA)?.driver_code ?? codeB;
  }

  const sA = byCode.get(codeA);
  const sB = byCode.get(codeB);

  if (!sA || !sB) {
    return (
      <main className="flex-1 w-full">
        <PageHeader kicker="Driver comparison" title="Head to head" />
        <section>
          <div className="container-max">
            <p className="text-muted">Standings are unavailable right now.</p>
          </div>
        </section>
      </main>
    );
  }

  // Static map first; fall back to Jolpica's season driver list for codes it
  // doesn't cover (e.g. mid-season substitutes).
  const needsLookup = !driverIdFromCode(codeA) || !driverIdFromCode(codeB);
  const seasonDrivers = needsLookup ? await getDrivers() : [];
  const idFor = (code: string) =>
    driverIdFromCode(code) ?? seasonDrivers.find((d) => d.code?.toUpperCase() === code)?.driverId ?? null;
  const idA = idFor(codeA);
  const idB = idFor(codeB);
  const [rA, rB] = await Promise.all([
    idA ? getDriverResults(idA) : Promise.resolve([]),
    idB ? getDriverResults(idB) : Promise.resolve([]),
  ]);

  const statsA = seasonStats(rA);
  const statsB = seasonStats(rB);
  const h2h = headToHead(rA, rB);

  const colorA = teamColor(sA.team);
  const colorB = teamColor(sB.team);

  const options: CompareOption[] = standings.map((d) => ({
    code: d.driver_code,
    name: abbreviateName(d.driver_name),
  }));

  const int = (n: number) => String(n);
  const one = (n: number) => n.toFixed(1);
  const pos = (n: number) => `P${n}`;

  const rows: StatRow[] = [
    buildRow("Championship", sA.position, sB.position, "lower", pos),
    buildRow("Points", sA.points, sB.points, "higher", int),
    buildRow("Wins", sA.wins, sB.wins, "higher", int),
    buildRow("Podiums", statsA.podiums, statsB.podiums, "higher", int),
    buildRow("Best finish", statsA.bestFinish, statsB.bestFinish, "lower", pos),
    buildRow("Avg finish", statsA.avgFinish, statsB.avgFinish, "lower", one),
    buildRow("Avg grid", statsA.avgGrid, statsB.avgGrid, "lower", one),
    buildRow("Points finishes", statsA.pointsFinishes, statsB.pointsFinishes, "higher", int),
    buildRow("DNFs", statsA.dnfs, statsB.dnfs, "lower", int),
  ];

  const sharedRounds = h2h.rows.length;

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker="Driver comparison"
        title="Head to head"
        description="Pick any two drivers to compare their season side by side."
      />

      <section>
        <div className="container-max">
          <CompareSelectors options={options} a={codeA} b={codeB} />

          {/* Driver cards, same style as the driver grid */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <DriverHead standing={sA} color={colorA} />
            <DriverHead standing={sB} color={colorB} />
          </div>

          {/* Who finished ahead */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TallyCard label="Finished ahead in the race" a={h2h.raceWinsA} b={h2h.raceWinsB} codeA={codeA} codeB={codeB} colorA={colorA} colorB={colorB} />
            <TallyCard label="Started ahead on the grid" a={h2h.qualWinsA} b={h2h.qualWinsB} codeA={codeA} codeB={codeB} colorA={colorA} colorB={colorB} />
          </div>

          {/* Season stats */}
          <div className="mt-4 card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 h-12 border-b border-rule">
              <span className="font-display font-extrabold text-right">{codeA}</span>
              <span className="eyebrow text-center min-w-[120px]">Season</span>
              <span className="font-display font-extrabold">{codeB}</span>
            </div>
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3 border-b border-rule last:border-b-0 row-hover">
                <span
                  className={`text-right tabular text-[16px] ${r.better === "a" ? "font-display font-extrabold" : "text-muted"}`}
                  style={r.better === "a" ? { color: inkOf(colorA) } : undefined}
                >
                  {r.aStr}
                </span>
                <span className="eyebrow text-center whitespace-nowrap min-w-[120px]">{r.label}</span>
                <span
                  className={`tabular text-[16px] ${r.better === "b" ? "font-display font-extrabold" : "text-muted"}`}
                  style={r.better === "b" ? { color: inkOf(colorB) } : undefined}
                >
                  {r.bStr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-race breakdown */}
      <section className="section-y">
        <div className="container-max">
          <SectionTitle
            kicker={`${sharedRounds} shared ${sharedRounds === 1 ? "round" : "rounds"}`}
            title="Race by race"
          />
          {sharedRounds === 0 ? (
            <p className="mt-6 text-sm text-muted">No completed rounds yet where both drivers have a recorded result.</p>
          ) : (
            <div className="mt-6">
              <TableCard minWidth={560}>
                <thead>
                  <tr>
                    <th className="w-14">Rnd</th>
                    <th>Grand Prix</th>
                    <th className="num">{codeA}</th>
                    <th className="num">{codeB}</th>
                    <th className="num">Ahead</th>
                  </tr>
                </thead>
                <tbody>
                  {h2h.rows.map((row) => (
                    <tr key={row.round}>
                      <td className="font-display font-bold text-muted">{String(row.round).padStart(2, "0")}</td>
                      <td>
                        <Link href={`/races/${row.round}` as Route} className="font-semibold hover:text-f1 transition-colors">
                          {row.raceName}
                        </Link>
                      </td>
                      <ResultCell dnf={row.aDnf} text={row.aText} pos={row.aPos} win={row.winner === "a"} />
                      <ResultCell dnf={row.bDnf} text={row.bText} pos={row.bPos} win={row.winner === "b"} />
                      <td className="num">
                        {row.winner ? (
                          <span className="inline-flex items-center gap-2 font-display font-bold">
                            <span aria-hidden className="team-pip !h-4" style={{ background: row.winner === "a" ? colorA : colorB }} />
                            {row.winner === "a" ? codeA : codeB}
                          </span>
                        ) : (
                          <span className="text-muted-soft">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableCard>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/** Driver card in the team-colour style used by the driver grid. */
function DriverHead({ standing, color }: { standing: DriverStanding; color: string }) {
  return (
    <Link
      href={`/drivers/${standing.driver_code.toLowerCase()}` as Route}
      className="team-card p-5 sm:p-6 flex flex-col gap-6 min-h-[170px]"
      style={{ "--team": color } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-[26px] font-extrabold leading-none">P{standing.position}</span>
        <span className="text-right">
          <span className="block font-display text-[22px] font-extrabold leading-none">{standing.points}</span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 mt-1">Pts</span>
        </span>
      </div>
      <div className="mt-auto min-w-0">
        <DriverName name={standing.driver_name} className="block text-[clamp(1rem,2.4vw,1.5rem)] truncate" />
        <div className="text-[13px] text-white/75 mt-1">{teamShort(standing.team)}</div>
      </div>
    </Link>
  );
}

function TallyCard({
  label,
  a,
  b,
  codeA,
  codeB,
  colorA,
  colorB,
}: {
  label: string;
  a: number;
  b: number;
  codeA: string;
  codeB: string;
  colorA: string;
  colorB: string;
}) {
  const total = a + b;
  const aPct = total > 0 ? (a / total) * 100 : 50;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{label}</span>
        <span className="text-[13px] text-muted">{total} rounds</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-display text-[28px] font-extrabold tabular">
          {a} <span className="text-[13px] font-bold text-muted">{codeA}</span>
        </span>
        <span className="font-display text-[28px] font-extrabold tabular">
          <span className="text-[13px] font-bold text-muted">{codeB}</span> {b}
        </span>
      </div>
      <div className="mt-3 flex h-[6px] w-full overflow-hidden rounded-full gap-[2px]">
        <div style={{ width: `${aPct}%`, background: colorA }} />
        <div style={{ width: `${100 - aPct}%`, background: colorB }} />
      </div>
    </div>
  );
}

function ResultCell({ dnf, text, pos, win }: { dnf: boolean; text: string | null; pos: number | null; win: boolean }) {
  const label = dnf ? "DNF" : pos != null ? `P${pos}` : (text ?? "—");
  return (
    <td className="num">
      <span className={dnf ? "text-muted-soft" : win ? "font-display font-extrabold" : "text-muted"}>{label}</span>
    </td>
  );
}
