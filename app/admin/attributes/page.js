"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import { X } from "lucide-react";
import AdminTable from "@/components/admin/AdminTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";

export default function AdminAttributesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [values, setValues] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const query = useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/variant-attributes", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load attributes");
      return data.attributes || data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, values };
      const wasEditing = Boolean(editingId);
      const url = editingId
        ? `/api/admin/variant-attributes/${editingId}`
        : "/api/admin/variant-attributes";

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
      setName("");
      setValueInput("");
      setValues([]);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      toast.success(wasEditing ? "Attribute updated" : "Attribute created");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/variant-attributes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      toast.success("Attribute permanently deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const attributes = Array.isArray(query.data) ? query.data : [];

  function addValue() {
    const next = valueInput.trim();
    if (!next) return;
    if (values.some((value) => value.toLowerCase() === next.toLowerCase())) {
      toast.error("Value already added");
      return;
    }
    setValues([...values, next]);
    setValueInput("");
  }

  function startEdit(attribute) {
    setEditingId(attribute._id);
    setName(attribute.name || "");
    setValues((attribute.values || []).map((value) => value.name || value));
    setValueInput("");
  }

  async function handleDelete(row) {
    if (
      !window.confirm(
        `Permanently delete attribute "${row.name}"? This cannot be undone.`,
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
        <h1 className="text-2xl font-bold">Variant attributes</h1>
        <p className="text-sm opacity-70">
          Example: Size with values S, M, L — used by variable products.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 md:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!values.length) {
            toast.error("Add at least one value");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <Input
          label="Attribute name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Size, Color, Storage..."
          required
        />

        <div>
          <p className="mb-2 text-sm font-medium">Values</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input input-bordered w-full"
              value={valueInput}
              placeholder="Type a value and press Add"
              onChange={(event) => setValueInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addValue();
                }
              }}
            />
            <button type="button" className="btn btn-outline" onClick={addValue}>
              Add value
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {values.map((value) => (
              <span key={value} className="badge badge-lg gap-1">
                {value}
                <button
                  type="button"
                  className="opacity-70"
                  onClick={() =>
                    setValues(values.filter((item) => item !== value))
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {!values.length ? (
              <span className="text-sm opacity-60">No values yet</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={saveMutation.isPending}>
            {editingId ? "Update attribute" : "Create attribute"}
          </Button>
          {editingId ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setEditingId(null);
                setName("");
                setValues([]);
                setValueInput("");
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? (
        <ErrorState message={query.error.message} onRetry={query.refetch} />
      ) : null}

      {!query.isLoading && !query.isError ? (
        <AdminTable
          columns={[
            { key: "name", label: "Name" },
            {
              key: "values",
              label: "Values",
              render: (row) =>
                (row.values || [])
                  .map((value) => value.name || value)
                  .join(", "),
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
          rows={attributes}
          emptyText="No attributes yet"
        />
      ) : null}
    </div>
  );
}
