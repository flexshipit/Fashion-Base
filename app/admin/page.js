"use client";

import Link from "next/link";
import DashboardStats from "@/components/admin/DashboardStats";
import OrdersChart from "@/components/admin/OrdersChart";
import PaymentChart from "@/components/admin/PaymentChart";
import RevenueChart from "@/components/admin/RevenueChart";
import TopProductsChart from "@/components/admin/TopProductsChart";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import { useAnalytics } from "@/hooks/admin/useAnalytics";

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, isError, error, refetch } = useAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm opacity-70">
          Sales, collections, and order health at a glance.
        </p>
      </div>

      {isLoading ? <Loading /> : null}
      {isError ? <ErrorState message={error.message} onRetry={refetch} /> : null}

      {analytics ? (
        <>
          <DashboardStats analytics={analytics} />

          <div className="grid gap-4 xl:grid-cols-2">
            <RevenueChart
              last7Days={analytics.last7Days}
              todayRevenue={analytics.todayRevenue}
              monthRevenue={analytics.monthRevenue}
              revenue={analytics.revenue}
              collectedRevenue={analytics.collectedRevenue}
            />
            <OrdersChart data={analytics.orderStatusBreakdown || []} />
          </div>

          <PaymentChart
            paymentMethodBreakdown={analytics.paymentMethodBreakdown}
            paymentStatusBreakdown={analytics.paymentStatusBreakdown}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <TopProductsChart products={analytics.topProducts || []} />
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="mb-3 font-semibold">Low stock alert</h2>
              <div className="space-y-2 text-sm">
                {(analytics.lowStockProducts || []).slice(0, 8).map((product) => (
                  <div key={product._id} className="flex justify-between gap-3">
                    <span className="line-clamp-1">{product.name}</span>
                    <span
                      className={
                        product.stock <= 2 ? "text-error font-medium" : ""
                      }
                    >
                      {product.stock} left
                    </span>
                  </div>
                ))}
                {!analytics.lowStockProducts?.length ? (
                  <p className="opacity-70">No low stock products.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Recent orders</h2>
              <Link href="/admin/orders" className="link link-primary text-sm">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.recentOrders || []).map((order) => (
                    <tr key={order._id || order.orderNumber}>
                      <td>
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="link link-primary"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td>{order.customer?.name || "-"}</td>
                      <td className="capitalize">{order.status}</td>
                      <td className="capitalize">
                        {order.payment?.method} · {order.payment?.status}
                      </td>
                      <td className="text-right">
                        {formatMoney(order.pricing?.grandTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!analytics.recentOrders?.length ? (
                <p className="py-4 text-sm opacity-70">No orders yet.</p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
