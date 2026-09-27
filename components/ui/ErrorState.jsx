export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-error/30 bg-error/5 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-error">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-outline btn-sm mt-6" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
