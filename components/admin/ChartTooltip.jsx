"use client";

/** Shared Recharts tooltip — DaisyUI themes often hide default tooltip text. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}) {
  if (!active || !payload?.length) return null;

  const title =
    typeof labelFormatter === "function" ? labelFormatter(label, payload) : label;

  return (
    <div
      className="rounded-lg border border-base-300 px-3 py-2 shadow-lg"
      style={{
        background: "var(--color-base-100, #ffffff)",
        color: "var(--color-base-content, #1f2937)",
        minWidth: 140,
      }}
    >
      {title ? (
        <p className="mb-1.5 text-xs font-semibold capitalize opacity-80">
          {title}
        </p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const rawName = entry.name ?? entry.dataKey ?? "";
          const rawValue = entry.value;
          let displayValue = rawValue;
          let displayName = rawName;

          if (typeof formatter === "function") {
            const result = formatter(rawValue, rawName, entry, index, payload);
            if (Array.isArray(result)) {
              displayValue = result[0];
              displayName = result[1] ?? rawName;
            } else if (result != null) {
              displayValue = result;
            }
          }

          return (
            <div
              key={`${entry.dataKey}-${index}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-2 capitalize">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: entry.color || entry.fill || "#94a3b8" }}
                />
                {displayName}
              </span>
              <span className="font-semibold tabular-nums">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CHART_AXIS = {
  tick: { fontSize: 12, fill: "var(--color-base-content, #64748b)" },
  stroke: "var(--color-base-300, #e5e7eb)",
};

export const CHART_GRID = {
  strokeDasharray: "3 3",
  stroke: "var(--color-base-300, #e5e7eb)",
  opacity: 0.6,
};
