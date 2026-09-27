"use client";

import { useQuery } from "@tanstack/react-query";

export function useReviews(slug) {
  return useQuery({
    queryKey: ["reviews", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}/reviews`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reviews");
      return data.reviews || data;
    },
  });
}
