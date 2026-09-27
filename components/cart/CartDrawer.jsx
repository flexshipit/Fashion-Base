"use client";

/** Optional slide-over cart — page-based cart is the main flow for now. */
export default function CartDrawer({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button type="button" className="flex-1" aria-label="Close cart" onClick={onClose} />
      <aside className="h-full w-full max-w-md bg-base-100 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cart</h2>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
