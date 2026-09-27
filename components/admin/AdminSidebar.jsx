"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChartColumn,
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  Settings2,
  ShoppingBag,
  Star,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/attributes", label: "Attributes", icon: Settings2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumn },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-base-300 bg-base-100 lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link href="/admin" className="mb-6 px-2 text-lg font-bold">
          Admin <span className="text-primary">Panel</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-ghost justify-start gap-3 ${active ? "btn-active" : ""}`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="btn btn-outline btn-sm mt-4">
          <Boxes size={16} />
          Back to store
        </Link>
      </div>
    </aside>
  );
}
