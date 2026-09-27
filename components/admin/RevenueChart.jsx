"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip, CHART_AXIS, CHART_GRID } from "@/components/admin/ChartTooltip";

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function RevenueChart({
  last7Days = [],
  todayRevenue = 0,
  monthRevenue = 0,
  revenue = 0,
  collectedRevenue = 0,
}) {
  const chartData =
    last7Days.length > 0
      ? last7Days
      : [
          { label: "Today", sales: todayRevenue, orders: 0 },
          { label: "Month", sales: monthRevenue, orders: 0 },
          { label: "Total", sales: revenue, orders: 0 },
        ];

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Sales trend (last 7 days)</h3>
          <p className="text-xs opacity-60">
            Gross sales and order count over time
          </p>
        </div>
        <div className="text-right text-xs opacity-70">
          <p>Collected: {formatMoney(collectedRevenue)}</p>
          <p>All-time gross: {formatMoney(revenue)}</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="label" tick={CHART_AXIS.tick} stroke={CHART_AXIS.stroke} />
            <YAxis
              yAxisId="sales"
              tick={CHART_AXIS.tick}
              stroke={CHART_AXIS.stroke}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              allowDecimals={false}
              tick={CHART_AXIS.tick}
              stroke={CHART_AXIS.stroke}
              width={36}
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value, name) =>
                    name === "sales" || name === "Sales"
                      ? [formatMoney(value), "Sales"]
                      : [value, "Orders"]
                  }
                />
              }
            />
            <Legend />
            <Line
              yAxisId="sales"
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke="#36d399"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#36d399" }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#3abff8"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#3abff8" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
