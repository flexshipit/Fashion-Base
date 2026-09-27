"use client";

export default function ProductFilters({
  categories = [],
  selectedCategory = "",
  onCategoryChange,
  sort = "newest",
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 md:flex-row md:items-end md:justify-between">
      <label className="form-control w-full md:max-w-xs">
        <span className="label-text mb-1">Category</span>
        <select
          className="select select-bordered"
          value={selectedCategory}
          onChange={(event) => onCategoryChange?.(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="form-control w-full md:max-w-xs">
        <span className="label-text mb-1">Sort</span>
        <select
          className="select select-bordered"
          value={sort}
          onChange={(event) => onSortChange?.(event.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      </label>
    </div>
  );
}
