"use client";

import Link from "next/link";
import AdminTable from "@/components/admin/AdminTable";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";

export default function AdminProductsPage() {
  const { products, isLoading, isError, error, refetch, deleteProduct } =
    useAdminProducts({
      limit: 50,
    });

  async function handleDelete(row) {
    if (
      !window.confirm(
        `Permanently delete product "${row.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteProduct(row._id);
    } catch {
      // toast already shown
    }
  }

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => {
        const src = row.images?.[0]?.url;
        return src ? (
          <OptimizedImage
            src={src}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover"
            transformation={[{ width: 96, height: 96, quality: 70 }]}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-base-200 text-xs opacity-50">
            N/A
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <div className="min-w-40">
          <p className="font-medium">{row.name}</p>
          <p className="text-xs opacity-60">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) =>
        row.variants?.length ? (
          <span className="badge badge-outline">Variable</span>
        ) : (
          <span className="badge badge-ghost">Regular</span>
        ),
    },
    {
      key: "salePrice",
      label: "Price",
      render: (row) => {
        if (row.variants?.length) {
          const prices = row.variants
            .map((v) => v.salePrice)
            .filter(Number.isFinite);
          if (!prices.length) return "—";
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? `৳${min}` : `৳${min} - ৳${max}`;
        }
        return `৳${row.salePrice ?? 0}`;
      },
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) =>
        row.variants?.length
          ? row.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
          : (row.stock ?? 0),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`badge ${row.isActive ? "badge-success" : "badge-ghost"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Link
            href={`/admin/products/${row._id}`}
            className="btn btn-ghost btn-xs"
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm opacity-70">
            Manage catalog items and variants.
          </p>
        </div>
        <Link href="/admin/products/create" className="btn btn-primary btn-sm">
          Add product
        </Link>
      </div>

      {isLoading ? <Loading /> : null}
      {isError ? <ErrorState message={error.message} onRetry={refetch} /> : null}
      {!isLoading && !isError ? (
        <AdminTable
          columns={columns}
          rows={products}
          emptyText="No products yet"
        />
      ) : null}
    </div>
  );
}
