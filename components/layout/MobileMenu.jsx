"use client";

import Link from "next/link";

/** Kept for future mobile drawer use; Navbar already handles a simple menu. */
export default function MobileMenu({ open, onClose, links = [] }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-base-100/95 p-6 lg:hidden">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-lg font-bold">Menu</p>
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="btn btn-ghost justify-start"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
