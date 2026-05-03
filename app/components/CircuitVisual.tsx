/**
 * CircuitVisual — telemetry-styled track card.
 *
 * Honest about not being survey-accurate. Offers:
 *   • a stylised single-loop SVG outline per circuit
 *   • sector-coloured racing line (S1 / S2 / S3) using stroke-dash slices
 *   • DRS zones referenced in the data strip (where known)
 *   • checkered start/finish line + direction-of-travel arrow
 *   • monospace data strip: lat / long / length / turns / DRS
 *
 * Falls back to a generic outline for circuits we don't yet have a path for.
 */

import type { JolpicaCircuit } from "@/lib/jolpica";

const COUNTRY_FLAG: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  USA: "🇺🇸",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  "United Kingdom": "🇬🇧",
  Britain: "🇬🇧",
  Belgium: "🇧🇪",
  Hungary: "🇭🇺",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  UAE: "🇦🇪",
  "United Arab Emirates": "🇦🇪",
  Qatar: "🇶🇦",
};

interface CircuitMeta {
  /** SVG path in viewBox 0 0 200 100 */
  d: string;
  km?: number;
  turns?: number;
  drs?: number;
  lapRecord?: string;
  dir?: "cw" | "ccw";
}

const CIRCUITS: Record<string, CircuitMeta> = {
  suzuka: {
    d: "M22,58 C28,38 48,30 70,38 C88,46 92,60 78,68 C62,76 48,68 56,56 C68,42 92,34 116,40 C140,46 158,40 172,48 C186,58 184,74 168,78 C150,82 132,76 122,72 C110,68 96,76 80,80 C58,82 30,78 22,58 Z",
    km: 5.807, turns: 18, drs: 1, dir: "cw",
    lapRecord: "1:30.983 — Hamilton ’19",
  },
  monaco: {
    d: "M28,72 L28,46 L40,38 L52,32 L72,30 L88,32 L94,40 L94,52 L106,54 L116,46 L132,42 L156,42 L168,46 L174,54 L174,70 L162,80 L142,82 L62,82 L42,80 Z",
    km: 3.337, turns: 19, drs: 1, dir: "cw",
    lapRecord: "1:12.909 — Verstappen ’18",
  },
  spa: {
    d: "M22,58 L34,72 C44,82 60,84 74,76 L86,66 L98,52 L114,46 C130,42 142,36 158,40 C174,44 184,54 178,68 C170,80 152,80 136,72 C124,66 112,68 98,76 C82,86 56,86 34,76 C22,68 18,64 22,58 Z",
    km: 7.004, turns: 20, drs: 2, dir: "cw",
    lapRecord: "1:46.286 — Hamilton ’20",
  },
  silverstone: {
    d: "M22,52 C22,32 38,22 64,22 C92,22 122,28 152,28 C172,28 184,38 182,54 C180,68 168,76 148,78 C124,80 96,78 72,80 C46,82 22,72 22,52 Z",
    km: 5.891, turns: 18, drs: 2, dir: "cw",
    lapRecord: "1:27.097 — Sainz ’23",
  },
  monza: {
    d: "M20,72 L20,44 L42,38 L70,36 L96,30 L116,28 L142,30 L168,38 L182,46 L182,72 L168,78 L142,76 L116,72 L96,76 L70,80 L42,80 Z",
    km: 5.793, turns: 11, drs: 2, dir: "cw",
    lapRecord: "1:21.046 — Hamilton ’20",
  },
  interlagos: {
    d: "M178,30 L156,28 L130,30 L104,38 L78,52 L52,52 L32,60 L26,72 L40,82 L82,84 L122,82 L156,76 L172,66 L182,52 Z",
    km: 4.309, turns: 15, drs: 2, dir: "ccw",
    lapRecord: "1:10.540 — Bottas ’18",
  },
  marina_bay: {
    d: "M28,40 L52,34 L82,36 L106,42 L130,40 L154,36 L172,42 L180,54 L172,68 L156,76 L130,76 L106,72 L82,76 L58,80 L34,76 L24,64 L22,52 Z",
    km: 4.940, turns: 19, drs: 3, dir: "ccw",
    lapRecord: "1:34.486 — Hamilton ’23",
  },
  albert_park: {
    d: "M30,54 C30,32 56,24 88,28 C116,30 146,30 168,38 C182,44 182,58 174,68 C162,78 132,82 102,80 C72,78 38,76 30,54 Z",
    km: 5.278, turns: 14, drs: 4, dir: "cw",
    lapRecord: "1:19.813 — Norris ’24",
  },
  bahrain: {
    d: "M24,72 L24,44 L42,32 L66,28 L92,30 L92,52 L116,52 L116,30 L142,28 L168,32 L182,44 L182,72 L156,80 L52,80 Z",
    km: 5.412, turns: 15, drs: 3, dir: "cw",
    lapRecord: "1:31.447 — Sainz ’24",
  },
  imola: {
    d: "M26,56 C26,32 60,22 92,28 C118,32 152,22 174,38 C188,52 180,72 152,78 C124,82 96,76 72,80 C44,84 26,76 26,56 Z",
    km: 4.909, turns: 19, drs: 1, dir: "ccw",
    lapRecord: "1:15.484 — Hamilton ’20",
  },
  las_vegas: {
    d: "M26,72 L26,40 L60,40 L120,40 L150,50 L172,40 L182,50 L182,66 L172,76 L150,80 L60,80 Z",
    km: 6.201, turns: 17, drs: 2, dir: "ccw",
    lapRecord: "1:34.876 — Russell ’24",
  },
  miami: {
    d: "M30,54 C30,30 64,22 100,30 L130,42 C156,52 178,42 182,58 C184,74 156,82 124,76 C94,70 60,82 32,72 L26,64 Z",
    km: 5.412, turns: 19, drs: 3, dir: "cw",
    lapRecord: "1:29.708 — Verstappen ’23",
  },
  shanghai: {
    d: "M22,56 L36,30 L70,26 L92,38 L116,38 L146,28 L178,42 L182,56 L168,72 L132,80 L96,80 L60,76 L34,74 Z",
    km: 5.451, turns: 16, drs: 2, dir: "cw",
    lapRecord: "1:32.238 — Hamilton ’24",
  },
  jeddah: {
    d: "M22,56 L48,34 L82,36 L114,32 L148,30 L172,40 L182,56 L168,72 L138,76 L106,74 L78,80 L46,76 L26,68 Z",
    km: 6.174, turns: 27, drs: 3, dir: "ccw",
    lapRecord: "1:30.734 — Alonso ’21",
  },
  zandvoort: {
    d: "M26,42 L48,30 L78,30 L110,36 L138,32 L168,42 L182,58 L172,72 L146,80 L114,76 L84,80 L52,76 L28,64 L22,54 Z",
    km: 4.259, turns: 14, drs: 2, dir: "cw",
    lapRecord: "1:11.097 — Russell ’23",
  },
  red_bull_ring: {
    d: "M28,52 C28,32 60,24 96,32 L130,42 C158,50 184,46 182,62 C180,76 144,82 110,76 C76,72 38,82 28,62 Z",
    km: 4.318, turns: 10, drs: 3, dir: "cw",
    lapRecord: "1:05.619 — Sainz ’20",
  },
  hungaroring: {
    d: "M28,46 L52,30 L84,32 L106,42 L132,30 L162,36 L182,52 L172,68 L142,78 L114,72 L86,80 L58,76 L30,68 Z",
    km: 4.381, turns: 14, drs: 1, dir: "cw",
    lapRecord: "1:16.627 — Russell ’24",
  },
  baku: {
    d: "M22,68 L22,42 L40,32 L80,32 L96,40 L96,52 L116,52 L138,40 L172,40 L182,50 L172,68 L60,80 Z",
    km: 6.003, turns: 20, drs: 2, dir: "ccw",
    lapRecord: "1:43.009 — Leclerc ’19",
  },
  rodriguez: {
    d: "M22,60 C22,38 56,28 96,32 L132,40 C160,48 184,44 182,62 C178,76 148,80 116,74 C82,68 38,82 22,60 Z",
    km: 4.304, turns: 17, drs: 3, dir: "cw",
    lapRecord: "1:17.774 — Bottas ’21",
  },
  yas_marina: {
    d: "M28,44 L52,30 L88,28 L120,38 L148,32 L172,44 L182,60 L168,74 L138,80 L102,76 L76,80 L46,76 L26,64 Z",
    km: 5.281, turns: 16, drs: 2, dir: "ccw",
    lapRecord: "1:25.637 — Norris ’24",
  },
  losail: {
    d: "M26,52 C26,32 56,24 92,30 L132,38 C162,46 184,46 182,62 C176,76 144,82 110,76 C76,70 32,80 26,52 Z",
    km: 5.419, turns: 16, drs: 1, dir: "cw",
    lapRecord: "1:22.384 — Norris ’24",
  },
  americas: {
    d: "M22,52 L40,30 L66,28 L88,40 L116,30 L142,28 L168,36 L182,52 L168,72 L142,80 L114,74 L88,80 L62,76 L36,72 Z",
    km: 5.513, turns: 20, drs: 2, dir: "ccw",
    lapRecord: "1:36.169 — Leclerc ’19",
  },
};

const GENERIC: CircuitMeta = {
  d: "M28,54 C28,30 60,24 96,30 C130,36 162,30 178,46 C190,62 172,80 138,80 C100,80 62,82 36,72 C24,66 22,60 28,54 Z",
};

interface Props {
  circuit: JolpicaCircuit;
  variant?: "card" | "wide";
}

export default function CircuitVisual({ circuit, variant = "card" }: Props) {
  const flag = COUNTRY_FLAG[circuit.Location.country] ?? "🏁";
  const meta = CIRCUITS[circuit.circuitId] ?? GENERIC;
  const isReal = circuit.circuitId in CIRCUITS;
  const tall = variant === "wide";

  const SECTOR = ["#ffd60a", "#27f4d2", "#e10600"];

  return (
    <div
      className={`relative bg-ink text-paper overflow-hidden border border-ink ${
        tall ? "min-h-[300px]" : ""
      }`}
    >
      <div className="absolute inset-0 chevron-bg-soft pointer-events-none" aria-hidden />
      <div className="absolute inset-0 scanline pointer-events-none" aria-hidden />
      <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-f1" />

      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-f1-soft">
              ◢ Telemetry · Track Card
            </span>
            <div className="mt-2 font-display italic text-[clamp(1.4rem,3.2vw,2rem)] leading-tight text-paper">
              {circuit.circuitName}
            </div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.16em] uppercase text-paper/55">
              {circuit.Location.locality} · {circuit.Location.country}
            </div>
          </div>
          <span className="text-3xl md:text-4xl leading-none shrink-0" aria-hidden>
            {flag}
          </span>
        </div>

        <div className="mt-6 relative">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-auto"
            role="img"
            aria-label={`${circuit.circuitName} stylised layout`}
          >
            <defs>
              <pattern
                id={`check-${circuit.circuitId}`}
                x="0"
                y="0"
                width="2"
                height="2"
                patternUnits="userSpaceOnUse"
              >
                <rect width="2" height="2" fill="#ffffff" />
                <rect width="1" height="1" fill="#0e0e0e" />
                <rect x="1" y="1" width="1" height="1" fill="#0e0e0e" />
              </pattern>
            </defs>

            {/* faint guide grid */}
            <g stroke="rgba(250,247,242,0.05)" strokeWidth="0.3">
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="200" y2={(i + 1) * 10} />
              ))}
              {Array.from({ length: 19 }).map((_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
              ))}
            </g>

            {/* Outer glow halo */}
            <path
              d={meta.d}
              fill="none"
              stroke="rgba(225,6,0,0.18)"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Tarmac base */}
            <path
              d={meta.d}
              fill="none"
              stroke="rgba(250,247,242,0.10)"
              strokeWidth="3.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Sector 1 / 2 / 3 */}
            {SECTOR.map((color, i) => (
              <path
                key={i}
                d={meta.d}
                pathLength={300}
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="butt"
                strokeDasharray="100 200"
                strokeDashoffset={-i * 100}
              />
            ))}

            {/* Start / Finish marker */}
            <rect
              x="26"
              y="50"
              width="6"
              height="10"
              fill={`url(#check-${circuit.circuitId})`}
            />

            {/* Direction arrow */}
            <g aria-hidden>
              <path
                d={
                  meta.dir === "ccw"
                    ? "M104,28 L96,24 L96,32 Z"
                    : "M96,28 L104,24 L104,32 Z"
                }
                fill="#ffffff"
                opacity="0.85"
              />
            </g>

            {/* Pulsing start dot */}
            <circle cx="29" cy="55" r="2.4" fill="#e10600">
              <animate
                attributeName="opacity"
                values="1;0.35;1"
                dur="1.6s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Sector legend */}
            <g fontFamily="var(--font-mono)" fontSize="4.2" letterSpacing="0.2">
              {SECTOR.map((color, i) => (
                <g key={i} transform={`translate(${146 + i * 16},90)`}>
                  <rect
                    width="14"
                    height="6"
                    fill="rgba(0,0,0,0.5)"
                    stroke={color}
                    strokeWidth="0.4"
                  />
                  <text x="2.2" y="4.4" fill={color}>
                    S{i + 1}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 font-mono tabular text-[12px]">
          <DataCell label="Lat" value={`${Number(circuit.Location.lat).toFixed(3)}°`} />
          <DataCell label="Long" value={`${Number(circuit.Location.long).toFixed(3)}°`} />
          <DataCell label="Length" value={meta.km ? `${meta.km.toFixed(3)} km` : "—"} />
          <DataCell
            label="Turns / DRS"
            value={
              meta.turns
                ? `${meta.turns} · ${meta.drs ? `${meta.drs} DRS` : "—"}`
                : "—"
            }
          />
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-paper/55">
          {isReal
            ? "Stylised layout — recognisable but not survey-accurate."
            : "Generic placeholder — true outline pending."}{" "}
          {meta.lapRecord && (
            <span className="text-paper/75">Lap record · {meta.lapRecord}. </span>
          )}
          <a
            href={circuit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-paper/30 hover:decoration-f1 hover:text-f1 transition-colors"
          >
            Reference ↗
          </a>
        </p>
      </div>
    </div>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[9px] tracking-[0.2em] uppercase text-paper/40">{label}</span>
      <span className="text-paper">{value}</span>
    </div>
  );
}
