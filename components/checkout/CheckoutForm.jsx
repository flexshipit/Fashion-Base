"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import DeliveryForm from "@/components/checkout/DeliveryForm";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import OrderSummary from "@/components/checkout/OrderSummary";
import Button from "@/components/ui/Button";
import { saveGuestOrder } from "@/lib/utils/guestOrders";

const emptyDelivery = {
  name: "",
  phone: "",
  address: "",
  district: "",
  thana: "",
};

function buildAddress(delivery) {
  const parts = [delivery.address?.trim()];
  if (delivery.thana?.trim()) parts.push(delivery.thana.trim());
  return parts.filter(Boolean).join(", ");
}

export default function CheckoutForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [delivery, setDelivery] = useState(emptyDelivery);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function getPayload() {
    return {
      name: delivery.name.trim(),
      phone: delivery.phone.trim(),
      district: (delivery.district || delivery.city || "").trim(),
      address: buildAddress(delivery),
      paymentMethod,
      transactionId: paymentMethod === "cod" ? "" : transactionId.trim(),
    };
  }

  function validateClient() {
    const payload = getPayload();

    if (!payload.name) return "Full name is required";
    if (!/^01[3-9]\d{8}$/.test(payload.phone.replace(/\s+/g, ""))) {
      return "Enter a valid Bangladesh phone number (01XXXXXXXXX)";
    }
    if (!payload.district) return "District is required";
    if (!payload.address) return "Address is required";
    if (payload.paymentMethod !== "cod" && !payload.transactionId) {
      return "Transaction ID is required for bKash/Nagad";
    }
    return null;
  }

  const fetchCartPreview = useCallback(async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPreview(data.checkout || data.preview || data);
      } else {
        setPreview(null);
      }
    } catch (err) {
      console.error("Failed to fetch checkout preview:", err);
      setPreview(null);
    }
  }, []);

  useEffect(() => {
    fetchCartPreview();
  }, [fetchCartPreview]);

  async function placeOrder() {
    const clientError = validateClient();
    if (clientError) {
      toast.error(clientError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(getPayload()),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      const order = data.order;
      const orderNumber = order?.orderNumber || data.orderNumber;

      queryClient.setQueryData(["cart"], {
        items: [],
        subtotal: 0,
        itemCount: 0,
        totalQuantity: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      saveGuestOrder({
        orderNumber,
        phone: order?.customer?.phone || getPayload().phone,
        status: order?.status || "pending",
        grandTotal: order?.pricing?.grandTotal,
        createdAt: order?.createdAt || new Date().toISOString(),
      });

      toast.success(`Order placed! Code: ${orderNumber}`);
      router.push(`/orders/${orderNumber}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 text-lg font-semibold">Delivery details</h2>
          <DeliveryForm value={delivery} onChange={setDelivery} />
        </section>

        <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 text-lg font-semibold">Payment</h2>
          <PaymentMethod
            value={paymentMethod}
            onChange={(method) => {
              setPaymentMethod(method);
              if (method === "cod") setTransactionId("");
            }}
            transactionId={transactionId}
            onTransactionIdChange={setTransactionId}
          />
        </section>

        <Button
          loading={loading}
          onClick={placeOrder}
          className="w-full sm:w-auto"
        >
          Place order
        </Button>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary preview={preview} />
      </div>
    </div>
  );
}
