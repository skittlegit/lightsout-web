import type { DriverPrediction } from "@/lib/types";
import { heatmapColor, heatmapTextColor } from "@/lib/format";

interface Props {
  drivers: DriverPrediction[];
}

/**
 * Server-rendered 20×20 heatmap.
 * Rows: drivers sorted by expected_position.
 * Cols: positions P1..P20.
 */
export default function PredictionHeatmap({ drivers }: Props) {
  const sorted = [...drivers]
    .sort((a, b) => a.expected_position - b.expected_position)
    .slice(0, 20);

  const positions = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto no-scrollbar -mx-[var(--gutter-x)] md:mx-0 px-[var(--gutter-x)] md:px-0 fade-x-edges">
      <table
        className="border-collapse min-w-[860px] w-full text-[10px]"
        role="table"
        aria-label="Predicted finishing-position distribution per driver"
      >
        <thead>
          <tr>
            <th scope="col" className="text-left pr-3 pb-2 align-bottom">
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
              <th scope="row" className="pr-3 py-0.5 whitespace-nowrap text-left font-normal">
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
                      borderRight: "1px solid rgba(217,210,197,0.4)",
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
    </div>
  );
}
