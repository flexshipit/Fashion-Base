"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/lib/toast/toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUploader from "@/components/admin/ImageUploader";
import ProductVariantsEditor, {
  emptyVariant,
} from "@/components/admin/ProductVariantsEditor";
import { calcDiscount, slugify } from "@/lib/utils/slugify";

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm opacity-65">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function normalizeInitial(initialValues = {}) {
  const hasVariants = Array.isArray(initialValues.variants)
    ? initialValues.variants.length > 0
    : initialValues.productType === "variable";

  const selectedAttributeIds = [];
  if (hasVariants && initialValues.variants?.length) {
    initialValues.variants.forEach((variant) => {
      (variant.attributes || []).forEach((attr) => {
        const id = attr.attributeId?._id || attr.attributeId;
        if (id && !selectedAttributeIds.includes(String(id))) {
          selectedAttributeIds.push(String(id));
        }
      });
    });
  }

  return {
    name: initialValues.name || "",
    slug: initialValues.slug || "",
    slugManual: Boolean(initialValues.slug),
    description: initialValues.description || "",
    category: initialValues.category?._id || initialValues.category || "",
    images: initialValues.images || [],
    productType: hasVariants ? "variable" : "simple",
    originalPrice: initialValues.originalPrice ?? "",
    salePrice: initialValues.salePrice ?? "",
    stock: initialValues.stock ?? "",
    rating: initialValues.rating ?? 0,
    reviewCount: initialValues.reviewCount ?? 0,
    isFeatured: Boolean(initialValues.isFeatured),
    isActive: initialValues.isActive !== false,
    selectedAttributeIds,
    variants: hasVariants
      ? (initialValues.variants || []).map((variant) => ({
          key: variant._id || crypto.randomUUID(),
          _id: variant._id,
          sku: variant.sku || "",
          originalPrice: variant.originalPrice ?? "",
          salePrice: variant.salePrice ?? "",
          stock: variant.stock ?? "",
          isActive: variant.isActive !== false,
          images: variant.images || [],
          attributeValues: Object.fromEntries(
            (variant.attributes || []).map((attr) => [
              String(attr.attributeId?._id || attr.attributeId),
              String(attr.valueId?._id || attr.valueId),
            ]),
          ),
        }))
      : [],
  };
}

export default function ProductForm({
  mode = "create",
  initialValues,
  categories = [],
  attributes = [],
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState(() => normalizeInitial(initialValues));

  const discount = calcDiscount(form.originalPrice, form.salePrice);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNameChange(value) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slugManual ? prev.slug : slugify(value),
    }));
  }

  function buildPayload() {
    const base = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      description: form.description.trim(),
      category: form.category,
      images: form.images,
      rating: Number(form.rating) || 0,
      reviewCount: Math.max(0, Math.trunc(Number(form.reviewCount) || 0)),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    if (form.productType === "simple") {
      return {
        ...base,
        originalPrice: Number(form.originalPrice),
        salePrice: Number(form.salePrice),
        stock: Number(form.stock),
        variants: [],
      };
    }

    const attributeMap = new Map(
      attributes.map((attr) => [String(attr._id), attr]),
    );

    const variants = form.variants.map((variant) => {
      const attrs = form.selectedAttributeIds.map((attributeId) => {
        const attribute = attributeMap.get(String(attributeId));
        const valueId = variant.attributeValues?.[attributeId];
        const value = attribute?.values?.find(
          (item) => String(item._id) === String(valueId),
        );

        return {
          attributeId,
          valueId,
          attributeName: attribute?.name || "",
          valueName: value?.name || "",
        };
      });

      return {
        ...(variant._id ? { _id: variant._id } : {}),
        sku: variant.sku.trim(),
        originalPrice: Number(variant.originalPrice),
        salePrice: Number(variant.salePrice),
        stock: Number(variant.stock),
        images: variant.images || [],
        isActive: variant.isActive !== false,
        attributes: attrs,
      };
    });

    return {
      ...base,
      variants,
    };
  }

  function validateBeforeSubmit() {
    if (!form.name.trim()) return "Product name is required";
    if (!form.category) return "Category is required";

    if (form.productType === "variable") {
      if (!form.selectedAttributeIds.length) {
        return "Select at least one variant attribute";
      }
      if (!form.variants.length) {
        return "Add at least one variant for a variable product";
      }

      for (const [index, variant] of form.variants.entries()) {
        if (!variant.sku?.trim()) {
          return `Variant ${index + 1} needs a SKU`;
        }
        for (const attributeId of form.selectedAttributeIds) {
          if (!variant.attributeValues?.[attributeId]) {
            return `Variant ${index + 1} is missing attribute values`;
          }
        }
      }
    }

    return null;
  }

  return (
    <form
      className="space-y-5 pb-24"
      onSubmit={(event) => {
        event.preventDefault();
        const errorMessage = validateBeforeSubmit();
        if (errorMessage) {
          toast.error(errorMessage);
          return;
        }
        onSubmit?.(buildPayload());
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/products"
            className="btn btn-ghost btn-square btn-sm mt-0.5"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "edit" ? "Edit product" : "Add product"}
            </h1>
            <p className="text-sm opacity-70">
              Fill in details, pricing, media, and organization.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <div className="space-y-5">
          <Section
            title="Basic information"
            description="Name and description shown on the storefront."
          >
            <div className="grid gap-4">
              <Input
                label="Product name"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                required
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    slug: slugify(event.target.value),
                    slugManual: true,
                  }));
                }}
                placeholder="auto-generated-from-name"
              />
              <p className="-mt-2 text-xs opacity-60">
                Slug is generated from the name. You can edit it if needed.
              </p>
              <Textarea
                label="Description"
                rows={8}
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                placeholder="Write full product details..."
              />
            </div>
          </Section>

          <Section
            title="Product type"
            description="Regular products use one price. Variable products use variants."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "simple",
                  title: "Regular product",
                  text: "Single price and stock for the whole product.",
                },
                {
                  id: "variable",
                  title: "Variable product",
                  text: "Separate price and stock per size, color, etc.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.productType === option.id
                      ? "border-primary bg-primary/5"
                      : "border-base-300 hover:border-base-content/20"
                  }`}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      productType: option.id,
                      variants:
                        option.id === "variable" && !prev.variants.length
                          ? [emptyVariant(prev.selectedAttributeIds)]
                          : prev.variants,
                    }));
                  }}
                >
                  <p className="font-semibold">{option.title}</p>
                  <p className="mt-1 text-sm opacity-70">{option.text}</p>
                </button>
              ))}
            </div>
          </Section>

          {form.productType === "simple" ? (
            <Section
              title="Price & stock"
              description="Required for regular products."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  label="Original price (৳)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.originalPrice}
                  onChange={(event) =>
                    setField("originalPrice", event.target.value)
                  }
                  required
                />
                <Input
                  label="Sale price (৳)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(event) => setField("salePrice", event.target.value)}
                  required
                />
                <Input
                  label="Discount %"
                  value={String(discount)}
                  readOnly
                />
                <Input
                  label="Stock quantity"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setField("stock", event.target.value)}
                  required
                />
              </div>
              <p className="mt-3 text-sm opacity-70">
                Stock status:{" "}
                <span className="font-medium">
                  {Number(form.stock) > 0 ? "In stock" : "Out of stock"}
                </span>
              </p>
            </Section>
          ) : (
            <Section
              title="Variants"
              description="Each row is one sellable combination."
            >
              <ProductVariantsEditor
                attributes={attributes}
                selectedAttributeIds={form.selectedAttributeIds}
                onSelectedAttributesChange={(ids) =>
                  setField("selectedAttributeIds", ids)
                }
                variants={form.variants}
                onVariantsChange={(variants) => setField("variants", variants)}
              />
            </Section>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Section
            title="Media"
            description="Upload one or more product images."
          >
            <ImageUploader
              images={form.images}
              onChange={(images) => setField("images", images)}
              folder="/products"
              maxFiles={12}
            />
          </Section>

          <Section
            title="Organization"
            description="Category and visibility settings."
          >
            <div className="space-y-4">
              <div className="flex w-full flex-col gap-1.5">
                <label className="text-sm font-medium opacity-80">
                  Category *
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Input
                  label="Rating (0-5)"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(event) => setField("rating", event.target.value)}
                />
                <Input
                  label="Review count"
                  type="number"
                  min="0"
                  value={form.reviewCount}
                  onChange={(event) =>
                    setField("reviewCount", event.target.value)
                  }
                />
              </div>

              <div className="space-y-3 rounded-xl border border-base-300 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-medium">Featured product</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={form.isFeatured}
                    onChange={(event) =>
                      setField("isFeatured", event.target.checked)
                    }
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-medium">Active in store</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={form.isActive}
                    onChange={(event) =>
                      setField("isActive", event.target.checked)
                    }
                  />
                </label>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-base-300 bg-base-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2 px-4 py-3">
          <Link href="/admin/products" className="btn btn-ghost">
            Cancel
          </Link>
          <Button type="submit" loading={loading} className="gap-2">
            <Save size={16} />
            {mode === "edit" ? "Update product" : "Save product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
