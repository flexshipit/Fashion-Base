"use client";

import Link from "next/link";
import AdminTable from "@/components/admin/AdminTable";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import { useAdminOrders } from "@/hooks/admin/useAdminOrders";

export default function AdminOrdersPage() {
  const { orders, isLoading, isError, error, refetch, updateStatus } =
    useAdminOrders({ limit: 50 });

  const columns = [
    {
      key: "orderNumber",
      label: "Order",
      render: (row) => (
        <Link href={`/admin/orders/${row.orderNumber}`} className="link link-primary">
          #{row.orderNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => row.customer?.name || row.user?.name || "-",
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `৳${row.pricing?.grandTotal ?? 0}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <select
          className="select select-bordered select-xs"
          value={row.status}
          onChange={(event) =>
            updateStatus({ orderNumber: row.orderNumber, status: event.target.value })
          }
        >
          {[
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm opacity-70">Track and update customer orders.</p>
      </div>

      {isLoading ? <Loading /> : null}
      {isError ? <ErrorState message={error.message} onRetry={refetch} /> : null}
      {!isLoading && !isError ? (
        <AdminTable columns={columns} rows={orders} emptyText="No orders yet" />
      ) : null}
    </div>
  );
}
