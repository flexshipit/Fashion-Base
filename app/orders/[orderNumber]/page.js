"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Container from "@/components/layout/Container";
import OrderDetails from "@/components/order/OrderDetails";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import { useOrder } from "@/hooks/queries/useOrders";
import {
  getGuestOrdersServerSnapshot,
  getGuestOrdersSnapshot,
  subscribeGuestOrders,
} from "@/lib/utils/guestOrders";

const emptySubscribe = () => () => {};

function getQueryPhone() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("phone") || "";
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderNumber =
    typeof params?.orderNumber === "string" ? params.orderNumber : "";

  const queryPhone = useSyncExternalStore(
    emptySubscribe,
    getQueryPhone,
    () => "",
  );

  const guestOrders = useSyncExternalStore(
    subscribeGuestOrders,
    getGuestOrdersSnapshot,
    getGuestOrdersServerSnapshot,
  );

  const saved = guestOrders.find((item) => item.orderNumber === orderNumber);
  const phone = queryPhone || saved?.phone || "";

  const { data: order, isLoading, isError, error, refetch } = useOrder(
    orderNumber,
    phone,
  );

  return (
    <Container className="space-y-4 py-10">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p>
          Order code: <strong>{orderNumber}</strong>
        </p>
        <p className="mt-1 opacity-80">
          Keep this code. You can always check status from{" "}
          <Link href="/track" className="link link-primary">
            Track order
          </Link>{" "}
          using this code + your phone number.
        </p>
      </div>

      {isLoading ? <Loading /> : null}
      {isError ? (
        <ErrorState
          title="Order not found in this session"
          message={error.message}
          onRetry={refetch}
        />
      ) : null}
      {isError ? (
        <Link href="/track" className="btn btn-primary btn-sm">
          Track with order number + phone
        </Link>
      ) : null}
      {order ? <OrderDetails order={order} /> : null}
    </Container>
  );
}
