"use client";

export default function VariantSelector({
  variants = [],
  selectedVariantId,
  onChange,
}) {
  if (!variants.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Choose option</p>
      <div className="flex flex-wrap gap-2">
        {variants
          .filter((variant) => variant.isActive !== false)
          .map((variant) => {
            const label =
              variant.attributes
                ?.map((attr) => attr.valueName || attr.value)
                .join(" / ") || variant.sku;

            return (
              <button
                key={variant._id}
                type="button"
                className={`btn btn-sm ${
                  String(selectedVariantId) === String(variant._id)
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => onChange?.(variant)}
              >
                {label}
              </button>
            );
          })}
      </div>
    </div>
  );
}
