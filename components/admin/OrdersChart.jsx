"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartTooltip } from "@/components/admin/ChartTooltip";

const COLORS = {
  pending: "#fbbd23",
  confirmed: "#3abff8",
  processing: "#60a5fa",
  shipped: "#818cf8",
  delivered: "#36d399",
  cancelled: "#f87272",
  returned: "#a3a3a3",
};

const FALLBACK = ["#36d399", "#3abff8", "#fbbd23", "#f87272", "#818cf8", "#a3a3a3"];

function toSharePercent(value, total) {
  if (!total) return 0;
  return Math.round(((value || 0) / total) * 100);
}

export default function OrdersChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  // Do NOT name a field `percent` — Recharts treats it as its own 0–1 ratio
  // and labels end up like 6700% when multiplied by 100 again.
  const chartData = data.map((item, index) => ({
    name: item._id || "unknown",
    value: item.count || 0,
    sharePercent: toSharePercent(item.count, total),
    fill: COLORS[item._id] || FALLBACK[index % FALLBACK.length],
  }));

  if (!chartData.length) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm opacity-70">
        No order status data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Orders by status</h3>
          <p className="text-xs opacity-60">{total} total orders</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={96}
              paddingAngle={2}
              label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
                const RADIAN = Math.PI / 180;
                const pct =
                  payload?.sharePercent ?? Math.round((percent || 0) * 100);
                const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                if (pct < 5) return null;
                return (
                  <text
                    x={x}
                    y={y}
                    fill="var(--color-base-content, #334155)"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={11}
                  >
                    {`${name} ${pct}%`}
                  </text>
                );
              }}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value, name, entry) => [
                    `${value} (${entry?.payload?.sharePercent ?? 0}%)`,
                    name,
                  ]}
                />
              }
            />
            <Legend
              formatter={(value) => (
                <span
                  className="capitalize text-sm"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
