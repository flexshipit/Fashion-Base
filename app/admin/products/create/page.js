"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductForm from "@/components/admin/ProductForm";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";

async function fetchAdminCategories() {
  const res = await fetch("/api/admin/categories", { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load categories");
  return data.categories || [];
}

async function fetchAdminAttributes() {
  const res = await fetch("/api/admin/variant-attributes", {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load attributes");
  return data.attributes || [];
}

export default function CreateProductPage() {
  const router = useRouter();
  const { createProduct, isSaving } = useAdminProducts();

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
  });

  const attributesQuery = useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: fetchAdminAttributes,
  });

  if (categoriesQuery.isLoading || attributesQuery.isLoading) {
    return <Loading label="Loading product form..." />;
  }

  if (categoriesQuery.isError || attributesQuery.isError) {
    return (
      <ErrorState
        message={
          categoriesQuery.error?.message ||
          attributesQuery.error?.message ||
          "Failed to load form data"
        }
        onRetry={() => {
          categoriesQuery.refetch();
          attributesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <ProductForm
        mode="create"
        categories={(categoriesQuery.data || []).filter(
          (category) => category.isActive !== false,
        )}
        attributes={attributesQuery.data || []}
        loading={isSaving}
        onSubmit={async (payload) => {
          try {
            await createProduct(payload);
            router.push("/admin/products");
          } catch {
            // toast already shown by mutation
          }
        }}
      />
    </div>
  );
}
