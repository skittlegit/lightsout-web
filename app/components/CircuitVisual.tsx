/**
 * Decorative circuit card. Honest about not being the real track shape:
 * shows locality, country, coordinates, and a stylised racing-line SVG.
 *
 * For a handful of marquee circuits we draw a recognizable simplified
 * outline; the rest get a generic abstract racing line.
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

/* ------------------- Per-circuit SVG paths (viewBox 0 0 200 100) --------- */
/* Simplified, recognizable, hand-drawn. Not survey-accurate.               */

const TRACK_PATHS: Record<string, string> = {
  // Suzuka — figure 8
  suzuka:
    "M20,55 C30,30 60,28 80,40 C100,52 95,72 75,75 C55,78 40,65 55,52 C75,35 110,32 135,42 C160,50 175,40 180,55 C185,72 165,82 140,78 C115,75 95,82 70,80 C40,78 18,72 20,55 Z",
  // Monaco — tight street circuit
  monaco:
    "M30,72 L30,40 L55,30 L80,30 L92,38 L92,52 L110,52 L120,42 L160,42 L172,52 L172,72 L150,82 L60,82 L40,82 Z",
  // Spa — Eau Rouge / La Source loops
  spa: "M25,55 C40,75 70,82 90,70 L110,55 L130,42 C150,32 175,38 180,55 C182,72 160,80 140,72 C120,65 105,70 90,80 C70,90 30,80 25,55 Z",
  // Silverstone — fast loop
  silverstone:
    "M25,50 C25,30 60,22 95,25 C140,28 175,38 180,55 C182,75 150,82 110,80 C70,78 35,75 25,50 Z",
  // Monza — temple of speed
  monza:
    "M20,72 L20,42 L80,38 L100,28 L150,30 L180,42 L180,72 L155,80 L120,75 L90,78 L60,80 Z",
  // Interlagos — anticlockwise
  interlagos:
    "M180,30 L150,28 L100,38 L70,55 L40,55 L25,68 L40,80 L120,82 L165,75 L180,55 Z",
  // Marina Bay — Singapore street
  marina_bay:
    "M28,40 L80,35 L120,45 L160,38 L180,55 L165,72 L120,75 L90,72 L60,80 L30,75 L25,55 Z",
  // Albert Park — Melbourne
  albert_park:
    "M30,55 C30,32 70,25 110,30 C150,35 180,45 178,60 C175,78 130,82 95,80 C60,78 32,72 30,55 Z",
  // Bahrain
  bahrain:
    "M25,72 L25,42 L60,30 L100,32 L100,52 L130,52 L130,32 L170,32 L180,42 L180,72 Z",
  // Imola
  imola:
    "M28,55 C28,30 70,25 110,30 C140,35 175,28 178,52 C180,72 140,82 105,75 C75,70 50,80 28,55 Z",
  // Las Vegas
  las_vegas:
    "M28,72 L28,40 L120,40 L150,50 L172,40 L180,52 L172,68 L150,80 L60,80 Z",
  // Miami — biscayne
  miami:
    "M30,55 C30,30 70,25 105,32 L130,42 C155,50 175,42 178,58 C180,75 140,82 110,75 C85,70 60,80 35,72 Z",
  // Shanghai
  shanghai:
    "M25,55 L40,30 L90,28 L100,40 L130,40 L155,30 L180,55 L155,75 L115,80 L80,75 L40,75 Z",
  // Jeddah
  jeddah:
    "M25,55 L60,35 L100,38 L150,32 L175,42 L180,60 L155,75 L110,75 L80,80 L40,75 Z",
};

const GENERIC_PATH =
  "M30,55 C30,30 65,25 100,30 C140,35 175,32 178,55 C180,75 140,82 100,78 C65,75 32,75 30,55 Z";

interface Props {
  circuit: JolpicaCircuit;
  variant?: "card" | "wide";
}

export default function CircuitVisual({ circuit, variant = "card" }: Props) {
  const flag = COUNTRY_FLAG[circuit.Location.country] ?? "🏁";
  const path = TRACK_PATHS[circuit.circuitId] ?? GENERIC_PATH;
  const isReal = circuit.circuitId in TRACK_PATHS;

  const tall = variant === "wide";

  return (
    <div
      className={`relative bg-paper-deep border border-rule p-6 md:p-8 ${
        tall ? "min-h-[260px]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow-red block">Circuit</span>
          <div className="mt-2 font-display text-[26px] md:text-[32px] leading-tight">
            {circuit.circuitName}
          </div>
          <div className="eyebrow mt-2">
            {circuit.Location.locality} · {circuit.Location.country}
          </div>
        </div>
        <span className="text-3xl md:text-4xl leading-none" aria-hidden>
          {flag}
        </span>
      </div>

      <div className="mt-6">
        <svg
          viewBox="0 0 200 100"
          className="w-full h-auto"
          role="img"
          aria-label={`${circuit.circuitName} stylised layout`}
        >
          {/* faint guide grid */}
          <g stroke="var(--color-rule)" strokeWidth="0.3" opacity="0.6">
            <line x1="0" y1="50" x2="200" y2="50" />
            <line x1="100" y1="0" x2="100" y2="100" />
          </g>
          {/* outer racing line */}
          <path
            d={path}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Inner shadow */}
          <path
            d={path}
            fill="none"
            stroke="var(--color-f1)"
            strokeWidth="0.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.55"
            transform="translate(1.5, 1.5)"
          />
          {/* start/finish marker */}
          <circle cx="30" cy="55" r="2.4" fill="var(--color-f1)" />
        </svg>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 font-mono tabular text-[11px] tracking-[0.12em] text-muted">
        <div>
          <span className="block text-[9px] tracking-[0.18em] text-muted/70 uppercase">
            Lat
          </span>
          {Number(circuit.Location.lat).toFixed(4)}°
        </div>
        <div>
          <span className="block text-[9px] tracking-[0.18em] text-muted/70 uppercase">
            Long
          </span>
          {Number(circuit.Location.long).toFixed(4)}°
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        {isReal
          ? "Stylised layout — recognisable but not survey-accurate."
          : "Generic layout placeholder — true outline pending."}{" "}
        <a
          href={circuit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-rule hover:decoration-ink hover:text-ink transition-colors"
        >
          Reference ↗
        </a>
      </p>
    </div>
  );
}
