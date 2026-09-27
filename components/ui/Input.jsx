import { cn } from "@/lib/utils/cn";

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium opacity-80">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "input input-bordered w-full",
          error && "input-error",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
