"use client";

import { useQuery } from "@tanstack/react-query";

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await fetch(`/api/products${buildQuery(params)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load products");
      return data;
    },
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ["product", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load product");
      return data.product || data;
    },
  });
}
