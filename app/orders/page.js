"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import OrderCard from "@/components/order/OrderCard";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useOrders } from "@/hooks/queries/useOrders";
import { useAuth } from "@/hooks/queries/useAuth";
import {
  getGuestOrdersServerSnapshot,
  getGuestOrdersSnapshot,
  subscribeGuestOrders,
} from "@/lib/utils/guestOrders";

function mergeOrders(orders, guestOrders) {
  const apiOrders = Array.isArray(orders) ? orders : orders?.orders || [];
  const map = new Map();

  apiOrders.forEach((order) => {
    map.set(order.orderNumber, order);
  });

  guestOrders.forEach((saved) => {
    if (!map.has(saved.orderNumber)) {
      map.set(saved.orderNumber, {
        orderNumber: saved.orderNumber,
        status: saved.status || "pending",
        createdAt: saved.createdAt,
        pricing: { grandTotal: saved.grandTotal ?? 0 },
        customer: { phone: saved.phone },
        _fromLocal: true,
      });
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading, isError, error, refetch } = useOrders();

  const guestOrders = useSyncExternalStore(
    subscribeGuestOrders,
    getGuestOrdersSnapshot,
    getGuestOrdersServerSnapshot,
  );

  const list = mergeOrders(orders, guestOrders);

  return (
    <Container className="space-y-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My orders</h1>
          <p className="text-sm opacity-70">
            {user
              ? "Your account order history."
              : "Orders from this browser, plus any you tracked. Use Track Order from another device."}
          </p>
        </div>
        <Link href="/track" className="btn btn-outline btn-sm">
          Track order
        </Link>
      </div>

      {!user && !authLoading ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 text-sm">
          <p>
            Guest tip: save your <strong>order number</strong>. On another
            browser, open{" "}
            <Link href="/track" className="link link-primary">
              Track order
            </Link>{" "}
            and enter the order number + phone.
          </p>
        </div>
      ) : null}

      {isLoading ? <Loading /> : null}
      {isError ? <ErrorState message={error.message} onRetry={refetch} /> : null}

      {!isLoading && !list.length ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will show up here."
          actionHref="/products"
          actionLabel="Start shopping"
        />
      ) : null}

      <div className="grid gap-4">
        {list.map((order) => (
          <OrderCard key={order._id || order.orderNumber} order={order} />
        ))}
      </div>
    </Container>
  );
}
