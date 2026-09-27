"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";

export function useAdminReviews(params = {}) {
  const queryClient = useQueryClient();
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const queryText = search.toString();

  const query = useQuery({
    queryKey: ["admin", "reviews", params],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/reviews${queryText ? `?${queryText}` : ""}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reviews");
      return data;
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Review update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review updated");
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    reviews: query.data?.reviews || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateReview: updateReview.mutateAsync,
  };
}
