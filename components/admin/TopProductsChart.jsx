"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartTooltip,
  CHART_AXIS,
  CHART_GRID,
} from "@/components/admin/ChartTooltip";

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function shortName(name = "Product", max = 18) {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export default function TopProductsChart({ products = [] }) {
  const chartData = products.slice(0, 6).map((item) => ({
    name: shortName(item._id?.name || "Product"),
    fullName: item._id?.name || "Product",
    quantity: item.quantity || 0,
    revenue: item.revenue || 0,
  }));

  if (!chartData.length) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm opacity-70">
        No product sales data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
      <div className="mb-4">
        <h3 className="font-semibold">Top products by units sold</h3>
        <p className="text-xs opacity-60">Hover a bar for revenue details</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
          >
            <CartesianGrid {...CHART_GRID} horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={CHART_AXIS.tick}
              stroke={CHART_AXIS.stroke}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={CHART_AXIS.tick}
              stroke={CHART_AXIS.stroke}
            />
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(_label, payload) =>
                    payload?.[0]?.payload?.fullName || ""
                  }
                  formatter={(value, name, entry) =>
                    name === "quantity" || name === "Units sold"
                      ? [
                          `${value} units · ${formatMoney(entry?.payload?.revenue)}`,
                          "Units sold",
                        ]
                      : [value, name]
                  }
                />
              }
            />
            <Bar
              dataKey="quantity"
              name="Units sold"
              fill="#818cf8"
              radius={[0, 6, 6, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
