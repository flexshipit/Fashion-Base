export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-10">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
}
