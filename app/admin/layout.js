"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/queries/useAuth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="admin-surface flex min-h-screen items-center justify-center">
        <Loading label="Checking admin access..." />
      </div>
    );
  }

  return (
    <div className="admin-surface flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminNavbar />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
