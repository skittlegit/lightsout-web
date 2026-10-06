import type { DriverPrediction } from "@/lib/types";
import { heatmapColor, heatmapTextColor } from "@/lib/format";
import HScroll from "./HScroll";

interface Props {
  drivers: DriverPrediction[];
}

/* Sticky driver column: an opaque background plus a hairline on its scroll
   edge so probability cells slide beneath it cleanly. */
const stickyCell = {
  background: "var(--color-paper-deep)",
  boxShadow: "inset -1px 0 0 var(--color-rule)",
} as const;

/**
 * Server-rendered heatmap for the full race field.
 * Rows: drivers sorted by expected_position.
 * Cols: all finishing positions returned by the forecast.
 *
 * Wrapped in HScroll so the matrix is actually reachable with a mouse; the
 * driver column stays pinned while the position columns scroll. The table
 * uses border-separate — sticky cells inside border-collapse tables still
 * misrender in Chromium.
 */
export default function PredictionHeatmap({ drivers }: Props) {
  const sorted = [...drivers].sort((a, b) => a.expected_position - b.expected_position);

  const positions = Array.from({ length: Math.max(0, ...drivers.map((driver) => driver.position_distribution.length)) }, (_, i) => i + 1);

  return (
    <HScroll
      ariaLabel="Predicted finishing-position distribution matrix"
      noFadeLeft
    >
      <table
        className="border-separate border-spacing-[2px] min-w-[860px] w-full text-[11px]"
        aria-label="Predicted finishing-position distribution per driver"
      >
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-[1] text-left pr-3 pb-2 align-bottom w-[150px]"
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
                  <span className="font-display text-[13px]">{d.driver_code}</span>
                  <span className="text-[12.5px] text-muted">{d.driver_name.split(" ").at(-1)}</span>
                </div>
              </th>
              {d.position_distribution.map((p, i) => {
                const showValue = p >= 0.05;
                return (
                  <td
                    key={i}
                    className="text-center tabular align-middle rounded-[4px] font-semibold"
                    style={{
                      background: heatmapColor(p),
                      color: heatmapTextColor(p),
                      width: 30,
                      height: 28,
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
