"use client";

import { useState } from "react";
import { toast } from "@/lib/toast/toast";
import Container from "@/components/layout/Container";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import OrderDetails from "@/components/order/OrderDetails";
import { saveGuestOrder } from "@/lib/utils/guestOrders";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTrack(event) {
    event.preventDefault();
    setLoading(true);
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim().toUpperCase(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not find order");

      setOrder(data.order);
      saveGuestOrder({
        orderNumber: data.order.orderNumber,
        phone: data.order.customer?.phone,
        status: data.order.status,
        grandTotal: data.order.pricing?.grandTotal,
        createdAt: data.order.createdAt,
      });
      toast.success("Order found");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold">Track order</h1>
        <p className="mt-1 text-sm opacity-70">
          Enter your order number and the phone used at checkout. Works even
          without login, from any browser.
        </p>
      </div>

      <form
        onSubmit={handleTrack}
        className="grid max-w-xl gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Input
            label="Order number"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="e.g. FS-XXXXXX"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            Track order
          </Button>
        </div>
      </form>

      {order ? (
        <div className="space-y-3">
          <p className="text-sm opacity-70">
            Save this order number:{" "}
            <span className="font-semibold">{order.orderNumber}</span>
          </p>
          <OrderDetails order={order} />
        </div>
      ) : null}
    </Container>
  );
}
