import Link from "next/link";

export default function EmptyState({
  title = "Nothing here yet",
  description = "Check back later.",
  actionHref,
  actionLabel,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/50 px-6 py-16 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm opacity-70">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary btn-sm mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
