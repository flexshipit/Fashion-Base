import OptimizedImage from "@/components/ui/OptimizedImage";

export default function CartItem({ item, onUpdate, onRemove }) {
  const product = item.product || {};
  const image =
    item.image?.url ||
    product.images?.[0]?.url ||
    product.images?.[0] ||
    null;

  return (
    <div className="flex gap-4 border-b border-base-300 py-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-base-200">
        {image ? (
          <OptimizedImage
            src={image}
            alt={product.name || "Item"}
            fill
            sizes="80px"
            className="object-cover"
            transformation={[{ width: 160, height: 160, quality: 75 }]}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{product.name || item.productName}</p>
            <p className="text-sm opacity-70">
              ৳{item.currentSalePrice ?? item.salePrice ?? item.price}
              {item.priceChanged ? (
                <span className="ml-2 text-warning">(price updated)</span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => onRemove?.(item._id)}
          >
            Remove
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-square"
            onClick={() =>
              onUpdate?.({
                itemId: item._id,
                quantity: Math.max(1, (item.quantity || 1) - 1),
              })
            }
          >
            -
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button
            type="button"
            className="btn btn-sm btn-square"
            onClick={() =>
              onUpdate?.({
                itemId: item._id,
                quantity: (item.quantity || 1) + 1,
              })
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
