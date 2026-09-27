"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchHomepage() {
  const res = await fetch("/api/homepage", { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load homepage");
  return data;
}

export function useHomepageContent() {
  return useQuery({
    queryKey: ["homepage"],
    queryFn: fetchHomepage,
    staleTime: 60_000,
  });
}
