"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";

export function useAdminOrders(params = {}) {
  const queryClient = useQueryClient();
  const search = new URLSearchParams(params).toString();

  const query = useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders${search ? `?${search}` : ""}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderNumber, status }) => {
      const res = await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      if (variables?.orderNumber) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "order", variables.orderNumber],
        });
      }
      toast.success("Order status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    ...query,
    orders: query.data?.orders || [],
    updateStatus: updateStatus.mutateAsync,
  };
}
