import type { DriverPrediction } from "@/lib/types";
import { heatmapColor, heatmapTextColor } from "@/lib/format";
import HScroll from "./HScroll";

interface Props {
  drivers: DriverPrediction[];
}

/* Sticky driver column: an opaque background plus a hairline on its scroll
   edge so probability cells slide beneath it cleanly. */
const stickyCell = {
  background: "var(--color-paper)",
  boxShadow: "inset -1px 0 0 var(--color-rule)",
} as const;

/**
 * Server-rendered 20×20 heatmap.
 * Rows: drivers sorted by expected_position.
 * Cols: positions P1..P20.
 *
 * Wrapped in HScroll so the matrix is actually reachable with a mouse; the
 * driver column stays pinned while the position columns scroll. The table
 * uses border-separate — sticky cells inside border-collapse tables still
 * misrender in Chromium.
 */
export default function PredictionHeatmap({ drivers }: Props) {
  const sorted = [...drivers]
    .sort((a, b) => a.expected_position - b.expected_position)
    .slice(0, 20);

  const positions = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <HScroll
      ariaLabel="Predicted finishing-position distribution matrix"
      noFadeLeft
    >
      <table
        className="border-separate border-spacing-0 min-w-[860px] w-full text-[10px]"
        aria-label="Predicted finishing-position distribution per driver"
      >
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-[1] text-left pr-3 pb-2 align-bottom"
              style={stickyCell}
            >
              <span className="eyebrow">Driver</span>
            </th>
            {positions.map((p) => (
              <th
                key={p}
                scope="col"
                className="px-0 pb-2 text-center font-mono tabular text-muted font-medium"
                style={{ width: 28 }}
              >
                P{p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.driver_code}>
              <th
                scope="row"
                className="sticky left-0 z-[1] pr-3 py-0.5 whitespace-nowrap text-left font-normal"
                style={stickyCell}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono tabular text-[10px] text-muted w-5">
                    {String(Math.round(d.expected_position)).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[14px]">
                    {d.driver_name}
                  </span>
                </div>
              </th>
              {d.position_distribution.slice(0, 20).map((p, i) => {
                const showValue = p >= 0.05;
                return (
                  <td
                    key={i}
                    className="text-center font-mono tabular align-middle"
                    style={{
                      background: heatmapColor(p),
                      color: heatmapTextColor(p),
                      width: 28,
                      height: 26,
                      borderRight: "1px solid var(--color-rule)",
                    }}
                    title={`${d.driver_name} · P${i + 1} · ${(p * 100).toFixed(1)}%`}
                  >
                    {showValue ? Math.round(p * 100) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </HScroll>
  );
}
