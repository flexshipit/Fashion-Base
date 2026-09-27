import { FIXED_DELIVERY_CHARGE } from "@/lib/checkout/location";

function imageUrlOf(item) {
  if (!item) return null;
  if (typeof item.image === "string" && item.image) return item.image;
  if (item.image?.url) return item.image.url;

  const product = item.product;
  if (product && typeof product === "object") {
    if (typeof product.images?.[0] === "string") return product.images[0];
    if (product.images?.[0]?.url) return product.images[0].url;
    if (typeof product.image === "string") return product.image;
  }

  return null;
}

function variantLabelOf(item) {
  if (item.variantLabel) return item.variantLabel;
  if (item.variantName) return item.variantName;

  const attributes =
    item.variant?.attributes || item.selectedAttributes || [];

  const label = attributes
    .map(
      (attr) =>
        attr.valueName || attr.value || attr.attributeName || attr.name || "",
    )
    .filter(Boolean)
    .join(" / ");

  return label;
}

export function lineFromCheckoutItem(item, index) {
  const price = Number(item.salePrice ?? item.price ?? item.currentSalePrice ?? 0);
  const quantity = item.quantity || 1;

  return {
    id: item.cartItemId || item._id || `checkout-${index}`,
    name: item.productName || item.product?.name || item.name || "Product",
    image: imageUrlOf(item),
    quantity,
    price,
    lineTotal: Number(item.lineTotal ?? item.totalPrice ?? price * quantity),
    variantLabel: variantLabelOf(item),
  };
}

export function lineFromCartItem(item, index) {
  const product = item.product && typeof item.product === "object" ? item.product : null;
  const price = Number(
    item.currentSalePrice ?? item.salePrice ?? product?.salePrice ?? item.price ?? 0,
  );
  const quantity = item.quantity || 1;

  return {
    id: item._id || `cart-${index}`,
    name: product?.name || item.productName || item.name || "Product",
    image: imageUrlOf({ ...item, product }),
    quantity,
    price,
    lineTotal: price * quantity,
    variantLabel: variantLabelOf(item),
  };
}

export default function OrderSummary({
  preview,
  cartItems = [],
  fallbackItem = null,
}) {
  const pricing = preview?.pricing || {};
  const checkoutLines = (preview?.items || []).map(lineFromCheckoutItem);
  const cartLines = (cartItems || []).map(lineFromCartItem);
  const lines = checkoutLines.length
    ? checkoutLines
    : cartLines.length
      ? cartLines
      : fallbackItem
        ? [fallbackItem]
        : [];

  const summed = lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
  const subtotal = checkoutLines.length ? (pricing.subtotal ?? summed) : summed;
  const deliveryCharge = FIXED_DELIVERY_CHARGE;
  const grandTotal = subtotal + deliveryCharge - (pricing.discount ?? 0);

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="border-b border-base-300 pb-4 text-lg font-semibold tracking-tight text-base-content">
        Order Summary
      </h2>

      <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto border-b border-base-300 pb-4 pr-1">
        {!lines.length ? (
          <p className="text-sm text-base-content/75">Your cart is empty.</p>
        ) : null}

        {lines.map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-base-300 bg-base-200">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-base-content/60">
                  No image
                </div>
              )}
              <span className="absolute right-0 top-0 rounded-bl-lg bg-base-content px-1.5 py-0.5 text-[10px] font-bold text-base-100">
                x{item.quantity}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-base-content">{item.name}</p>
              {item.variantLabel ? (
                <p className="truncate text-xs text-base-content/70">
                  {item.variantLabel}
                </p>
              ) : null}
              <p className="mt-0.5 text-sm font-medium text-base-content">
                ৳{Number(item.price).toLocaleString()}
              </p>
            </div>

            <span className="whitespace-nowrap font-semibold text-base-content">
              ৳{Number(item.lineTotal).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-base-content/85">
          <span>Subtotal</span>
          <span>৳{Number(subtotal).toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-base-content/85">
          <span>Delivery Charge</span>
          <span className="font-medium text-base-content">
            ৳{deliveryCharge}
          </span>
        </div>

        <div className="flex justify-between border-t border-base-300 pt-2 text-base font-bold text-base-content">
          <span>Total Amount</span>
          <span className="text-lg">৳{Number(grandTotal).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
