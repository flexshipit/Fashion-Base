"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import OrderStatus from "@/components/order/OrderStatus";
import Button from "@/components/ui/Button";

export default function OrderDetails({ order, showCancel = true }) {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  if (!order) return null;

  const canCancel =
    showCancel && ["pending", "confirmed"].includes(order.status);

  async function cancelOrder() {
    if (!canCancel) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "Cancelled by customer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      toast.success("Order cancelled");
      queryClient.setQueryData(
        ["orders", order.orderNumber, "session"],
        data.order,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-sm opacity-70">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <p className="text-xl font-semibold">
            ৳{order.pricing?.grandTotal ?? 0}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <OrderStatus status={order.status} />
          {canCancel ? (
            <Button
              size="sm"
              variant="outline"
              loading={cancelling}
              onClick={cancelOrder}
            >
              Cancel order
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        <div className="space-y-3">
          {(order.items || []).map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{item.productName || item.name}</p>
                <p className="opacity-70">Qty: {item.quantity}</p>
              </div>
              <p>
                ৳
                {item.totalPrice ??
                  (item.unitPrice ?? item.salePrice ?? 0) * (item.quantity || 1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm">
          <h2 className="mb-3 text-lg font-semibold">Customer</h2>
          <p>{order.customer?.name}</p>
          <p>{order.customer?.phone}</p>
          <p>{order.customer?.address}</p>
          <p>
            {[order.customer?.thana, order.customer?.district || order.customer?.city]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm">
          <h2 className="mb-3 text-lg font-semibold">Payment</h2>
          <p className="capitalize">Method: {order.payment?.method}</p>
          <p className="capitalize">Status: {order.payment?.status}</p>
        </div>
      </div>
    </div>
  );
}
