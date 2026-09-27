"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import OrderDetails from "@/components/order/OrderDetails";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const orderNumber =
    typeof params?.orderNumber === "string" ? params.orderNumber : "";

  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipmentNote, setShipmentNote] = useState("");
  const [savingShipment, setSavingShipment] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "order", orderNumber],
    enabled: Boolean(orderNumber),
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load order");
      return data.order || data;
    },
  });

  const order = query.data;

  async function refreshOrder() {
    queryClient.invalidateQueries({ queryKey: ["admin", "order", orderNumber] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
  }

  async function handleStatusChange(status) {
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");

      toast.success("Order status updated");
      await refreshOrder();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function saveShipment() {
    setSavingShipment(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/shipment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courier: courier || order?.shipment?.courier || "",
          trackingNumber:
            trackingNumber || order?.shipment?.trackingNumber || "",
          note: shipmentNote || order?.shipment?.note || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Shipment update failed");
      toast.success("Shipment updated");
      await refreshOrder();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingShipment(false);
    }
  }

  async function updatePayment(status) {
    setPaymentBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status,
          rejectionReason: status === "rejected" ? "Rejected by admin" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment update failed");
      toast.success(
        status === "verified" ? "Payment verified" : "Payment rejected",
      );
      await refreshOrder();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPaymentBusy(false);
    }
  }

  if (query.isLoading) return <Loading />;
  if (query.isError) {
    return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  }

  const isOnlinePayment =
    order?.payment?.method && order.payment.method !== "cod";
  const canModeratePayment =
    isOnlinePayment && order?.payment?.status === "pending";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage order</h1>
          <p className="text-sm opacity-70">
            Set any status directly — pending to delivered, cancelled, etc.
          </p>
        </div>

        <label className="form-control w-full max-w-xs">
          <span className="label-text mb-1 text-xs opacity-70">
            Order status
          </span>
          <select
            className="select select-bordered"
            value={order?.status || "pending"}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
          <h2 className="font-semibold">Shipment</h2>
          <Input
            label="Courier"
            value={courier || order?.shipment?.courier || ""}
            onChange={(event) => setCourier(event.target.value)}
          />
          <Input
            label="Tracking number"
            value={trackingNumber || order?.shipment?.trackingNumber || ""}
            onChange={(event) => setTrackingNumber(event.target.value)}
          />
          <Input
            label="Note"
            value={shipmentNote || order?.shipment?.note || ""}
            onChange={(event) => setShipmentNote(event.target.value)}
          />
          <Button size="sm" loading={savingShipment} onClick={saveShipment}>
            Save shipment
          </Button>
        </section>

        {isOnlinePayment ? (
          <section className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
            <h2 className="font-semibold">Payment verification</h2>
            <p className="text-sm opacity-70">
              Method: {order.payment.method} · Txn:{" "}
              {order.payment.transactionId || "—"} · Status:{" "}
              {order.payment.status}
            </p>
            {canModeratePayment ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  loading={paymentBusy}
                  onClick={() => updatePayment("verified")}
                >
                  Verify payment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  loading={paymentBusy}
                  onClick={() => updatePayment("rejected")}
                >
                  Reject payment
                </Button>
              </div>
            ) : (
              <p className="text-sm opacity-70">No pending verification.</p>
            )}
          </section>
        ) : null}
      </div>

      <OrderDetails order={order} showCancel={false} />
    </div>
  );
}
