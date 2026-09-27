/** Create a URL-safe slug from a string */
export function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Discount % from original and sale price */
export function calcDiscount(originalPrice, salePrice) {
  const original = Number(originalPrice);
  const sale = Number(salePrice);

  if (!Number.isFinite(original) || original <= 0) return 0;
  if (!Number.isFinite(sale) || sale >= original) return 0;

  return Math.round(((original - sale) / original) * 100);
}
