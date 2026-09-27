"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import AdminTable from "@/components/admin/AdminTable";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reviews?limit=50", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reviews");
      return data;
    },
  });

  const moderate = useMutation({
    mutationFn: async ({ id, isApproved }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isApproved }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const reviews = query.data?.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm opacity-70">Approve or hide customer reviews.</p>
      </div>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? (
        <ErrorState message={query.error.message} onRetry={query.refetch} />
      ) : null}

      {!query.isLoading && !query.isError && !reviews.length ? (
        <EmptyState
          title="No reviews yet"
          description="Customer reviews will show up here after orders are delivered."
        />
      ) : null}

      {!query.isLoading && !query.isError && reviews.length ? (
        <AdminTable
          columns={[
            {
              key: "product",
              label: "Product",
              render: (row) => row.product?.name || "—",
            },
            {
              key: "user",
              label: "Customer",
              render: (row) => row.user?.name || row.user?.email || "—",
            },
            {
              key: "rating",
              label: "Rating",
              render: (row) => `${row.rating}/5`,
            },
            {
              key: "comment",
              label: "Comment",
              render: (row) => (
                <span className="line-clamp-2 max-w-xs text-sm">
                  {row.title ? <strong>{row.title}: </strong> : null}
                  {row.comment}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <span
                  className={`badge badge-sm ${
                    row.isApproved ? "badge-success" : "badge-warning"
                  }`}
                >
                  {row.isApproved ? "Approved" : "Hidden"}
                </span>
              ),
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <Button
                  size="sm"
                  variant="outline"
                  loading={moderate.isPending}
                  onClick={() =>
                    moderate.mutate({
                      id: row._id,
                      isApproved: !row.isApproved,
                    })
                  }
                >
                  {row.isApproved ? "Hide" : "Approve"}
                </Button>
              ),
            },
          ]}
          rows={reviews}
        />
      ) : null}
    </div>
  );
}
