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

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading, isError, error, refetch } = useAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm opacity-70">
          Gross sales vs collected revenue, status mix, and product performance.
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

          <div className="grid gap-4 lg:grid-cols-2">
            <TopProductsChart products={analytics.topProducts || []} />

            <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Low stock</h2>
                <Link href="/admin/products" className="link link-primary text-sm">
                  Products
                </Link>
              </div>
              <div className="space-y-3 text-sm">
                {(analytics.lowStockProducts || []).map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-base-300 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs opacity-60">
                        {formatMoney(product.salePrice || product.originalPrice)}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        product.stock <= 2 ? "badge-error" : "badge-warning"
                      }`}
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
        </>
      ) : null}
    </div>
  );
}
