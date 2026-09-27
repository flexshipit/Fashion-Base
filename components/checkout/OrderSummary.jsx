import { FIXED_DELIVERY_CHARGE } from "@/lib/checkout/location";

export default function OrderSummary({ preview }) {
  const pricing = preview?.pricing || preview || {};
  const items = preview?.items || [];

  const subtotal = pricing.subtotal ?? 0;
  const deliveryCharge = FIXED_DELIVERY_CHARGE;
  const grandTotal = subtotal + deliveryCharge - (pricing.discount ?? 0);

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-base-content border-b border-base-200 pb-4">
        Order Summary
      </h2>

      <div className="mt-4 space-y-3 border-b border-base-200 pb-4 max-h-[360px] overflow-y-auto pr-1">
        {!items.length ? (
          <p className="text-sm text-base-content/60">
            Your cart is empty.
          </p>
        ) : null}

        {items.map((item, index) => {
          const imageUrl =
            (typeof item.image === "string" ? item.image : item.image?.url) ||
            item.product?.image ||
            (item.product?.images && item.product.images[0]?.url) ||
            (item.product?.images && item.product.images[0]) ||
            null;

          const name =
            item.productName || item.product?.name || item.name || "Product";
          const lineTotal =
            item.lineTotal ??
            item.totalPrice ??
            (item.salePrice || item.price || 0) * (item.quantity || 1);

          const variantLabel = item.variantName
            || (item.variant?.attributes || [])
              .map((attr) => attr.value || attr.name)
              .filter(Boolean)
              .join(" / ");

          return (
            <div
              key={item.cartItemId || item._id || index}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-14 w-14 flex-shrink-0 rounded-lg border border-base-200 bg-base-200 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-base-content/40 uppercase">
                      No image
                    </div>
                  )}
                  <span className="absolute top-0 right-0 rounded-bl-lg bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    x{item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-base-content truncate">
                    {name}
                  </p>
                  {variantLabel ? (
                    <p className="text-xs text-base-content/60 truncate">
                      {variantLabel}
                    </p>
                  ) : null}
                </div>
              </div>

              <span className="font-medium text-base-content whitespace-nowrap">
                ৳{Number(lineTotal).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-base-content/80">
          <span>Subtotal</span>
          <span>৳{Number(subtotal).toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-base-content/80">
          <span>Delivery Charge</span>
          <span className="font-medium text-base-content">
            ৳{deliveryCharge}
          </span>
        </div>

        <div className="pt-2 border-t border-base-200 flex justify-between text-base font-bold text-base-content">
          <span>Total Amount</span>
          <span className="text-lg">৳{Number(grandTotal).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
