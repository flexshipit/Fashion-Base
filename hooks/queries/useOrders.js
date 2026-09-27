"use client";

import { useQuery } from "@tanstack/react-query";

export function useOrders() {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      const res = await fetch("/api/orders/my", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      return data.orders || data;
    },
  });
}

export function useOrder(orderNumber, phone = "") {
  return useQuery({
    queryKey: ["orders", orderNumber, phone || "session"],
    enabled: Boolean(orderNumber),
    queryFn: async () => {
      const search = phone
        ? `?phone=${encodeURIComponent(phone)}`
        : "";
      const res = await fetch(`/api/orders/${orderNumber}${search}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load order");
      return data.order || data;
    },
  });
}
