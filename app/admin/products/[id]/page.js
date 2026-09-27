"use client";

import { useParams, useRouter } from "next/navigation";
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

export default function EditProductPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const { updateProduct, isSaving } = useAdminProducts();

  const productQuery = useQuery({
    queryKey: ["admin", "product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load product");
      return data.product || data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
  });

  const attributesQuery = useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: fetchAdminAttributes,
  });

  const loading =
    productQuery.isLoading ||
    categoriesQuery.isLoading ||
    attributesQuery.isLoading;

  if (loading) return <Loading label="Loading product..." />;

  if (productQuery.isError || categoriesQuery.isError || attributesQuery.isError) {
    return (
      <ErrorState
        message={
          productQuery.error?.message ||
          categoriesQuery.error?.message ||
          attributesQuery.error?.message
        }
        onRetry={() => {
          productQuery.refetch();
          categoriesQuery.refetch();
          attributesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <ProductForm
        key={productQuery.data?._id}
        mode="edit"
        initialValues={productQuery.data}
        categories={(categoriesQuery.data || []).filter(
          (category) => category.isActive !== false,
        )}
        attributes={attributesQuery.data || []}
        loading={isSaving}
        onSubmit={async (payload) => {
          try {
            await updateProduct({ id, payload });
            router.push("/admin/products");
          } catch {
            // toast already shown by mutation
          }
        }}
      />
    </div>
  );
}
