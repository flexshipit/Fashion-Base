"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";

async function fetchCart() {
  const res = await fetch("/api/cart", { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load cart");
  return data.cart || data;
}

export function useCart() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const items = query.data?.items || [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const addItem = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not add to cart");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateItem = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not update cart");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (error) => toast.error(error.message),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId) => {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not remove item");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    cart: query.data,
    items,
    itemCount,
    isLoading: query.isLoading,
    addItem: addItem.mutateAsync,
    updateItem: updateItem.mutateAsync,
    removeItem: removeItem.mutateAsync,
  };
}
