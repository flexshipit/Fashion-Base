"use client";

import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/queries/useAuth";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-base-300 bg-base-100/90 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/admin" className="font-bold">
            Admin
          </Link>
          <Link href="/admin/products" className="btn btn-ghost btn-xs">
            Products
          </Link>
          <Link href="/admin/orders" className="btn btn-ghost btn-xs">
            Orders
          </Link>
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-medium">
            {greeting()}, {user?.name || "Admin"}
          </p>
          <p className="text-xs opacity-60">{today}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <span className="hidden text-sm opacity-70 sm:inline lg:hidden">
          {user?.name}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
