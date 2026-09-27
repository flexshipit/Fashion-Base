"use client";

import { useQuery } from "@tanstack/react-query";

export function useAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load analytics");
      return data.analytics || data;
    },
  });
}
