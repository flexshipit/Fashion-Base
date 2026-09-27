import Link from "next/link";

const statusColors = {
  pending: "badge-warning",
  confirmed: "badge-info",
  processing: "badge-info",
  shipped: "badge-primary",
  delivered: "badge-success",
  cancelled: "badge-error",
};

export default function OrderCard({ order }) {
  const phone = order.customer?.phone || "";
  const href = phone
    ? `/orders/${order.orderNumber}?phone=${encodeURIComponent(phone)}`
    : `/orders/${order.orderNumber}`;

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">#{order.orderNumber}</p>
          <p className="text-sm opacity-70">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "Saved order"}
          </p>
        </div>
        <span className={`badge ${statusColors[order.status] || "badge-ghost"}`}>
          {order.status || "pending"}
        </span>
      </div>
      <p className="mt-3 font-medium">
        ৳{order.pricing?.grandTotal ?? order.grandTotal ?? 0}
      </p>
    </Link>
  );
}
