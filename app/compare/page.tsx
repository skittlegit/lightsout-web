import type { Metadata } from "next";
import Link from "next/link";
import BackBar from "@/app/components/BackBar";
import Footer from "@/app/components/Footer";
import CompareSelectors, {
  type CompareOption,
} from "@/app/components/CompareSelectors";
import { getDriverStandings } from "@/lib/api";
import { getDriverResults } from "@/lib/jolpica";
import { driverIdFromCode } from "@/lib/slug";
import { abbreviateName, teamColor, teamShort } from "@/lib/format";
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
        <BackBar crumb="Drivers" crumbHref="/#drivers" label="Head to Head" />
        <section className="section-y">
          <div className="container-max">
            <p className="text-muted">Standings are unavailable right now.</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const idA = driverIdFromCode(codeA);
  const idB = driverIdFromCode(codeB);
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
      <BackBar crumb="Drivers" crumbHref="/#drivers" label="Head to Head" />

      <section className="section-y">
        <div className="container-max">
          <span className="eyebrow-red block">Driver Comparison</span>
          <h1 className="headline h-detail mt-2">
            Head to <em>Head</em>
          </h1>

          <div className="mt-8 md:mt-10">
            <CompareSelectors options={options} a={codeA} b={codeB} />
          </div>

          {/* Identity band */}
          <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 sm:gap-6">
            <DriverHead standing={sA} color={colorA} align="left" />
            <div className="flex items-center justify-center">
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted-soft uppercase">
                vs
              </span>
            </div>
            <DriverHead standing={sB} color={colorB} align="right" />
          </div>

          {/* H2H tallies */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TallyCard
              label="Race finishes — ahead"
              a={h2h.raceWinsA}
              b={h2h.raceWinsB}
              colorA={colorA}
              colorB={colorB}
            />
            <TallyCard
              label="Qualifying (grid) — ahead"
              a={h2h.qualWinsA}
              b={h2h.qualWinsB}
              colorA={colorA}
              colorB={colorB}
            />
          </div>

          {/* Stat comparison */}
          <div className="mt-10 border-t border-rule">
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 border-b border-rule py-3.5 row-hover"
              >
                <span
                  className={`font-mono tabular text-right text-[15px] sm:text-base ${
                    r.better === "a" ? "font-semibold" : "text-muted"
                  }`}
                  style={r.better === "a" ? { color: colorA } : undefined}
                >
                  {r.aStr}
                </span>
                <span className="eyebrow text-center whitespace-nowrap min-w-[96px] sm:min-w-[140px]">
                  {r.label}
                </span>
                <span
                  className={`font-mono tabular text-left text-[15px] sm:text-base ${
                    r.better === "b" ? "font-semibold" : "text-muted"
                  }`}
                  style={r.better === "b" ? { color: colorB } : undefined}
                >
                  {r.bStr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-race breakdown */}
      <section className="pb-16 md:pb-24">
        <div className="container-max">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="headline h-subsection">
              Race by <em>Race</em>
            </h2>
            <span className="eyebrow">
              {sharedRounds} shared {sharedRounds === 1 ? "round" : "rounds"}
            </span>
          </div>
          <div className="rule-thin mt-4" />

          {sharedRounds === 0 ? (
            <p className="mt-8 text-sm text-muted">
              No completed rounds yet where both drivers have a recorded result.
            </p>
          ) : (
            <div
              data-lenis-prevent
              className="mt-6 overflow-x-auto no-scrollbar -mx-[var(--gutter-x)] md:mx-0 px-[var(--gutter-x)] md:px-0"
            >
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr className="text-left">
                    <Th>R</Th>
                    <Th>Race</Th>
                    <Th className="text-right">{codeA}</Th>
                    <Th className="text-right">{codeB}</Th>
                    <Th className="text-right">Ahead</Th>
                  </tr>
                </thead>
                <tbody>
                  {h2h.rows.map((row) => (
                    <tr key={row.round} className="row-hover border-t border-rule">
                      <Td mono>{String(row.round).padStart(2, "0")}</Td>
                      <Td>
                        <Link
                          href={`/races/${row.round}`}
                          className="font-display italic hover:text-f1 transition-colors"
                        >
                          {row.raceName}
                        </Link>
                      </Td>
                      <ResultCell
                        dnf={row.aDnf}
                        text={row.aText}
                        pos={row.aPos}
                        win={row.winner === "a"}
                        color={colorA}
                      />
                      <ResultCell
                        dnf={row.bDnf}
                        text={row.bText}
                        pos={row.bPos}
                        win={row.winner === "b"}
                        color={colorB}
                      />
                      <td className="py-3 pr-1 text-right">
                        {row.winner ? (
                          <span
                            className="font-mono text-[11px] tracking-[0.12em] font-semibold"
                            style={{
                              color: row.winner === "a" ? colorA : colorB,
                            }}
                          >
                            {row.winner === "a" ? codeA : codeB}
                          </span>
                        ) : (
                          <span className="text-muted-soft">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 text-[11px] text-muted leading-relaxed">
            Standings from the lightsout-api backend; per-race results via the
            Jolpica F1 (Ergast-compatible) API. Qualifying head-to-head is based
            on starting grid position.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function DriverHead({
  standing,
  color,
  align,
}: {
  standing: DriverStanding;
  color: string;
  align: "left" | "right";
}) {
  const right = align === "right";
  return (
    <Link
      href={`/drivers/${standing.driver_code.toLowerCase()}`}
      className={`group flex flex-col gap-2 min-w-0 ${right ? "items-end text-right" : ""}`}
    >
      <span aria-hidden className="block w-full h-[5px]" style={{ background: color }} />
      <span
        className="font-mono tabular text-[12px] tracking-[0.18em]"
        style={{ color }}
      >
        {standing.driver_code}
      </span>
      <span className="font-display italic text-[clamp(1.4rem,4.5vw,2.4rem)] leading-[1.05] truncate max-w-full group-hover:text-f1 transition-colors">
        {standing.driver_name}
      </span>
      <span className="eyebrow truncate max-w-full">
        P{standing.position} · {teamShort(standing.team)}
      </span>
    </Link>
  );
}

function TallyCard({
  label,
  a,
  b,
  colorA,
  colorB,
}: {
  label: string;
  a: number;
  b: number;
  colorA: string;
  colorB: string;
}) {
  const total = a + b;
  const aPct = total > 0 ? (a / total) * 100 : 50;
  return (
    <div className="border border-rule p-4 card-deep">
      <span className="eyebrow block">{label}</span>
      <div className="mt-3 flex items-baseline justify-between">
        <span
          className="font-mono tabular text-2xl"
          style={{ color: a >= b ? colorA : undefined, fontWeight: a >= b ? 600 : 400 }}
        >
          {a}
        </span>
        <span className="eyebrow text-muted-soft">{total} rounds</span>
        <span
          className="font-mono tabular text-2xl"
          style={{ color: b >= a ? colorB : undefined, fontWeight: b >= a ? 600 : 400 }}
        >
          {b}
        </span>
      </div>
      <div className="mt-2 flex h-[4px] w-full overflow-hidden bg-paper-deep">
        <div style={{ width: `${aPct}%`, background: colorA }} />
        <div style={{ width: `${100 - aPct}%`, background: colorB }} />
      </div>
    </div>
  );
}

function ResultCell({
  dnf,
  text,
  pos,
  win,
  color,
}: {
  dnf: boolean;
  text: string | null;
  pos: number | null;
  win: boolean;
  color: string;
}) {
  let label: string;
  if (dnf) label = "DNF";
  else if (pos != null) label = `P${pos}`;
  else label = text ?? "—";

  return (
    <td className="py-3 pr-4 text-right font-mono tabular text-sm">
      <span
        style={win ? { color, fontWeight: 600 } : undefined}
        className={dnf ? "text-muted-soft" : win ? "" : "text-muted"}
      >
        {label}
      </span>
    </td>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`font-mono text-[10px] tracking-[0.16em] uppercase text-muted py-2 pr-4 font-medium ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`py-3 pr-4 text-sm ${mono ? "font-mono tabular" : ""}`}>
      {children}
    </td>
  );
}
