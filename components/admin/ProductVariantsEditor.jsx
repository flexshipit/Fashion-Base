"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import ImageUploader from "@/components/admin/ImageUploader";
import { calcDiscount, slugify } from "@/lib/utils/slugify";

function emptyVariant(selectedAttributeIds = []) {
  return {
    key: crypto.randomUUID(),
    sku: "",
    originalPrice: "",
    salePrice: "",
    stock: "",
    isActive: true,
    images: [],
    attributeValues: Object.fromEntries(
      selectedAttributeIds.map((id) => [id, ""]),
    ),
  };
}

export default function ProductVariantsEditor({
  attributes = [],
  selectedAttributeIds = [],
  onSelectedAttributesChange,
  variants = [],
  onVariantsChange,
}) {
  const activeAttributes = attributes.filter((attr) =>
    selectedAttributeIds.map(String).includes(String(attr._id)),
  );

  function toggleAttribute(attributeId) {
    const id = String(attributeId);
    const exists = selectedAttributeIds.map(String).includes(id);
    const nextIds = exists
      ? selectedAttributeIds.filter((item) => String(item) !== id)
      : [...selectedAttributeIds.map(String), id];

    onSelectedAttributesChange?.(nextIds);

    // Keep variant rows in sync with selected attributes
    onVariantsChange?.(
      variants.map((variant) => {
        const attributeValues = { ...variant.attributeValues };
        nextIds.forEach((attrId) => {
          if (!attributeValues[attrId]) attributeValues[attrId] = "";
        });
        Object.keys(attributeValues).forEach((attrId) => {
          if (!nextIds.includes(attrId)) delete attributeValues[attrId];
        });
        return { ...variant, attributeValues };
      }),
    );
  }

  function updateVariant(index, patch) {
    const next = variants.map((variant, i) =>
      i === index ? { ...variant, ...patch } : variant,
    );
    onVariantsChange?.(next);
  }

  function updateVariantField(index, field, value) {
    updateVariant(index, { [field]: value });
  }

  function autoSku(index) {
    const variant = variants[index];
    const parts = activeAttributes
      .map((attr) => {
        const valueId = variant.attributeValues?.[attr._id];
        const value = attr.values?.find((item) => item._id === valueId);
        return value?.name || "";
      })
      .filter(Boolean);

    const sku = slugify(parts.join("-")).toUpperCase() || `VAR-${index + 1}`;
    updateVariantField(index, "sku", sku);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Variant attributes</p>
        <p className="mb-3 text-xs opacity-60">
          Choose attributes first, then add each combination as a variant.
        </p>
        <div className="flex flex-wrap gap-2">
          {attributes.map((attr) => {
            const checked = selectedAttributeIds
              .map(String)
              .includes(String(attr._id));
            return (
              <label
                key={attr._id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                  checked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => toggleAttribute(attr._id)}
                />
                {attr.name}
              </label>
            );
          })}
          {!attributes.length ? (
            <p className="text-sm opacity-70">
              No attributes yet. Create them under Admin → Attributes.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => {
          const discount = calcDiscount(
            variant.originalPrice,
            variant.salePrice,
          );

          return (
            <div
              key={variant.key || variant._id || index}
              className="space-y-3 rounded-2xl border border-base-300 bg-base-200/30 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Variant {index + 1}</p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() =>
                    onVariantsChange?.(variants.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>

              {activeAttributes.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeAttributes.map((attr) => (
                    <div key={attr._id} className="flex w-full flex-col gap-1.5">
                      <label className="text-sm font-medium opacity-80">
                        {attr.name}
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={String(variant.attributeValues?.[attr._id] || "")}
                        onChange={(event) =>
                          updateVariant(index, {
                            attributeValues: {
                              ...variant.attributeValues,
                              [String(attr._id)]: event.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Select {attr.name}</option>
                        {(attr.values || []).map((value) => (
                          <option key={value._id} value={String(value._id)}>
                            {value.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Input
                    label="SKU"
                    value={variant.sku}
                    onChange={(event) =>
                      updateVariantField(index, "sku", event.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-link btn-xs px-0"
                    onClick={() => autoSku(index)}
                  >
                    Auto SKU
                  </button>
                </div>
                <Input
                  label="Original price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.originalPrice}
                  onChange={(event) =>
                    updateVariantField(index, "originalPrice", event.target.value)
                  }
                  required
                />
                <Input
                  label="Sale price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.salePrice}
                  onChange={(event) =>
                    updateVariantField(index, "salePrice", event.target.value)
                  }
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(event) =>
                    updateVariantField(index, "stock", event.target.value)
                  }
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="opacity-70">Discount: {discount}%</span>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-primary"
                    checked={variant.isActive !== false}
                    onChange={(event) =>
                      updateVariantField(index, "isActive", event.target.checked)
                    }
                  />
                  <span>Active</span>
                </label>
              </div>

              <ImageUploader
                label="Variant images (optional)"
                helpText="Optional images for this specific variant."
                folder="/products/variants"
                maxFiles={5}
                images={variant.images || []}
                onChange={(images) => updateVariantField(index, "images", images)}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={!selectedAttributeIds.length}
        onClick={() =>
          onVariantsChange?.([
            ...variants,
            emptyVariant(selectedAttributeIds.map(String)),
          ])
        }
      >
        <Plus size={16} />
        Add variant
      </button>
    </div>
  );
}

export { emptyVariant };
