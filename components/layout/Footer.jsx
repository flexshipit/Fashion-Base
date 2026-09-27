"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { useSiteBrand } from "@/components/layout/SiteBrand";
import { splitBrandName } from "@/lib/site/defaults";

export default function Footer() {
  const pathname = usePathname();

  const { siteName, footerNote, logo } = useSiteBrand();
  const brand = splitBrandName(siteName);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-base-300/70 bg-base-200/40">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl tracking-wide text-base-content">
            {logo?.url ? (
              <img src={logo.url} alt="" className="h-8 w-8 object-contain" />
            ) : null}
            <span>
              {brand.lead}
              {brand.accent ? (
                <span className="text-accent">{brand.accent}</span>
              ) : null}
            </span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-base-content/80">
            {footerNote}
          </p>
        </div>

        <div>
          <p className="section-eyebrow">Shop</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <Link
              href="/products"
              className="text-base-content/85 transition hover:text-base-content"
            >
              All products
            </Link>
            <Link
              href="/wishlist"
              className="text-base-content/85 transition hover:text-base-content"
            >
              Wishlist
            </Link>
            <Link
              href="/cart"
              className="text-base-content/85 transition hover:text-base-content"
            >
              Cart
            </Link>
          </div>
        </div>

        <div>
          <p className="section-eyebrow">Account</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <Link
              href="/login"
              className="text-base-content/85 transition hover:text-base-content"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-base-content/85 transition hover:text-base-content"
            >
              Register
            </Link>
            <Link
              href="/track"
              className="text-base-content/85 transition hover:text-base-content"
            >
              Track order
            </Link>
            <Link
              href="/orders"
              className="text-base-content/85 transition hover:text-base-content"
            >
              Orders
            </Link>
          </div>
        </div>
      </Container>

      <div className="border-t border-base-300/70 py-5 text-center text-[11px] uppercase tracking-[0.22em] text-base-content/70">
        © {new Date().getFullYear()} {siteName} · All rights reserved
      </div>
    </footer>
  );
}
