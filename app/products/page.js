"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/layout/Container";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";
import ProductSearch from "@/components/product/ProductSearch";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCategories } from "@/hooks/queries/useCategories";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState(
    () => searchParams.get("search") || "",
  );
  const [category, setCategory] = useState(
    () => searchParams.get("category") || "",
  );
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");

  useEffect(() => {
    const nextCategory = searchParams.get("category") || "";
    const nextSearch = searchParams.get("search") || "";
    const nextSort = searchParams.get("sort") || "newest";
    setCategory(nextCategory);
    setSubmittedSearch(nextSearch);
    setSearch(nextSearch);
    setSort(nextSort);
  }, [searchParams]);

  const { data, isLoading, isError, error, refetch } = useProducts({
    search: submittedSearch,
    category,
    sort,
    limit: 20,
  });
  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || [];
  const products = data?.products || [];

  return (
    <Container className="space-y-6 py-6 sm:py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm opacity-70">Browse and filter the catalog.</p>
      </div>

      <ProductSearch
        value={search}
        onChange={setSearch}
        onSubmit={setSubmittedSearch}
      />

      <ProductFilters
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />

      {isLoading ? <Loading /> : null}
      {isError ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : null}
      {!isLoading && !isError && !products.length ? (
        <EmptyState
          title="No products found"
          description="Try another search or create products in admin."
          actionHref="/admin/products/create"
          actionLabel="Create product"
        />
      ) : null}
      {!isLoading && !isError ? <ProductGrid products={products} /> : null}
    </Container>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <Loading />
        </Container>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
