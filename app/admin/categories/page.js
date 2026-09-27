"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import AdminTable from "@/components/admin/AdminTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUploader from "@/components/admin/ImageUploader";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import OptimizedImage from "@/components/ui/OptimizedImage";

const emptyForm = {
  name: "",
  description: "",
  image: null,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const query = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load categories");
      return data.categories || data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        image: form.image || { url: "", fileId: "" },
        isActive: form.isActive,
      };

      const wasEditing = Boolean(editingId);
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      return { data, wasEditing };
    },
    onSuccess: ({ wasEditing }) => {
      setForm(emptyForm);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(wasEditing ? "Category updated" : "Category created");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category permanently deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const categories = Array.isArray(query.data) ? query.data : [];

  function startEdit(category) {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image?.url
        ? { url: category.image.url, fileId: category.image.fileId || "" }
        : null,
      isActive: category.isActive !== false,
    });
  }

  async function handleDelete(row) {
    if (
      !window.confirm(
        `Permanently delete category "${row.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(row._id);
    } catch {
      // toast already shown
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm opacity-70">
          Create categories with optional image and description.
        </p>
      </div>

      <form
        className="grid gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 lg:grid-cols-[1.2fr_0.8fr]"
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate();
        }}
      >
        <div className="space-y-4">
          <Input
            label="Category name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <Textarea
            label="Description"
            rows={6}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Optional category description..."
          />
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
            />
            <span className="text-sm font-medium">Active</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saveMutation.isPending}>
              {editingId ? "Update category" : "Add category"}
            </Button>
            {editingId ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>

        <ImageUploader
          label="Category image"
          helpText="Optional cover image for this category."
          folder="/categories"
          maxFiles={1}
          images={form.image ? [form.image] : []}
          onChange={(images) => setForm({ ...form, image: images[0] || null })}
        />
      </form>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? (
        <ErrorState message={query.error.message} onRetry={query.refetch} />
      ) : null}

      {!query.isLoading && !query.isError ? (
        <AdminTable
          columns={[
            {
              key: "image",
              label: "Image",
              render: (row) =>
                row.image?.url ? (
                  <OptimizedImage
                    src={row.image.url}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                    transformation={[
                      { width: 80, height: 80, quality: 70 },
                    ]}
                  />
                ) : (
                  <span className="opacity-40">—</span>
                ),
            },
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
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
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => startEdit(row)}
                  >
                    Edit
                  </button>
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
          ]}
          rows={categories}
          emptyText="No categories yet"
        />
      ) : null}
    </div>
  );
}
