function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function DashboardStats({ analytics }) {
  const cards = [
    {
      label: "Gross sales",
      value: formatMoney(analytics?.revenue),
      hint: "All non-cancelled orders",
    },
    {
      label: "Collected",
      value: formatMoney(analytics?.collectedRevenue),
      hint: "Paid / verified payments",
    },
    {
      label: "Avg. order",
      value: formatMoney(analytics?.averageOrderValue),
      hint: "Gross sales ÷ orders",
    },
    {
      label: "Today sales",
      value: formatMoney(analytics?.todayRevenue),
      hint: `${analytics?.todayOrders || 0} orders today`,
    },
    {
      label: "This month",
      value: formatMoney(analytics?.monthRevenue),
      hint: `${analytics?.monthOrders || 0} orders this month`,
    },
    {
      label: "Total orders",
      value: analytics?.orders ?? 0,
      hint: `${analytics?.deliveredOrders || 0} delivered`,
    },
    {
      label: "Pending orders",
      value: analytics?.pendingOrders ?? 0,
      hint: "Pending / confirmed / processing",
    },
    {
      label: "Pending payments",
      value: analytics?.pendingPayments ?? 0,
      hint: "bKash / Nagad awaiting verify",
    },
    {
      label: "Customers",
      value: analytics?.customers ?? 0,
      hint: "Unique phone numbers from orders",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-base-300 bg-base-100 p-5"
        >
          <p className="text-sm opacity-70">{card.label}</p>
          <p className="mt-2 text-2xl font-bold">{card.value}</p>
          {card.hint ? (
            <p className="mt-1 text-xs opacity-60">{card.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
