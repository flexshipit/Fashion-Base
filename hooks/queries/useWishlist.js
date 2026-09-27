"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";

export function useWishlist() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load wishlist");
      return data.wishlist || data;
    },
  });

  const products = query.data?.products || [];
  const count =
    typeof query.data?.count === "number"
      ? query.data.count
      : products.length;

  const add = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not add to wishlist");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not remove");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    wishlist: query.data,
    products,
    count,
    isLoading: query.isLoading,
    add: add.mutateAsync,
    remove: remove.mutateAsync,
    has: (productId) =>
      products.some(
        (product) => (product._id || product)?.toString() === String(productId),
      ),
  };
}
