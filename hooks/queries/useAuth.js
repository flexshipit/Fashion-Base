"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";

async function fetchMe() {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load user");
  return data.user;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
  });

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Logged in");
    },
    onError: (error) => toast.error(error.message),
  });

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Register failed");
      return data;
    },
    onSuccess: () => toast.success("Account created. Please login."),
    onError: (error) => toast.error(error.message),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Logout failed");
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.invalidateQueries();
      toast.success("Logged out");
    },
  });

  return {
    user: query.data || null,
    isLoading: query.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: () => logoutMutation.mutate(),
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
