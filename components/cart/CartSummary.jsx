import Link from "next/link";

export default function CartSummary({ subtotal = 0, itemCount = 0 }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
      <h2 className="text-lg font-semibold">Order summary</h2>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Subtotal</span>
          <span>৳{subtotal}</span>
        </div>
      </div>
      <Link href="/checkout" className="btn btn-primary mt-6 w-full">
        Checkout
      </Link>
    </div>
  );
}
