"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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

const METHOD_COLORS = {
  cod: "#36d399",
  bkash: "#e2136e",
  nagad: "#f59e0b",
};

const STATUS_COLORS = {
  pending: "#fbbd23",
  verified: "#36d399",
  paid: "#22c55e",
  failed: "#f87272",
  refunded: "#a3a3a3",
};

const FALLBACK = ["#3abff8", "#818cf8", "#f87272", "#94a3b8"];

export default function PaymentChart({
  paymentMethodBreakdown = [],
  paymentStatusBreakdown = [],
}) {
  const methodData = paymentMethodBreakdown.map((item, index) => ({
    name: item._id || "unknown",
    value: item.count || 0,
    amount: item.amount || 0,
    fill: METHOD_COLORS[item._id] || FALLBACK[index % FALLBACK.length],
  }));

  const statusData = paymentStatusBreakdown.map((item, index) => ({
    name: item._id || "unknown",
    count: item.count || 0,
    amount: item.amount || 0,
    fill: STATUS_COLORS[item._id] || FALLBACK[index % FALLBACK.length],
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h3 className="mb-1 font-semibold">Payment methods</h3>
        <p className="mb-4 text-xs opacity-60">Share of orders by method</p>
        {methodData.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 18;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="var(--color-base-content, #334155)"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={11}
                        className="capitalize"
                      >
                        {`${name} (${value})`}
                      </text>
                    );
                  }}
                  labelLine={{
                    stroke: "var(--color-base-content, #94a3b8)",
                    strokeOpacity: 0.4,
                  }}
                >
                  {methodData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value, name, entry) => [
                        `${value} orders · ${formatMoney(entry?.payload?.amount)}`,
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
        ) : (
          <p className="text-sm opacity-70">No payment data yet.</p>
        )}
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h3 className="mb-1 font-semibold">Payment status amounts</h3>
        <p className="mb-4 text-xs opacity-60">Order value by payment status</p>
        {statusData.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid {...CHART_GRID} horizontal={false} />
                <XAxis
                  type="number"
                  tick={CHART_AXIS.tick}
                  stroke={CHART_AXIS.stroke}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : v
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ ...CHART_AXIS.tick, textTransform: "capitalize" }}
                  stroke={CHART_AXIS.stroke}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value, name, entry) =>
                        name === "amount" || name === "Amount"
                          ? [
                              `${formatMoney(value)} (${entry?.payload?.count || 0} orders)`,
                              "Amount",
                            ]
                          : [value, name]
                      }
                    />
                  }
                />
                <Bar dataKey="amount" name="Amount" radius={[0, 6, 6, 0]} barSize={22}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm opacity-70">No payment status data yet.</p>
        )}
      </div>
    </div>
  );
}
