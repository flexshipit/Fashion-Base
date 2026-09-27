import { cn } from "@/lib/utils/cn";

export default function Textarea({
  label,
  error,
  className = "",
  id,
  rows = 6,
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
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          "textarea textarea-bordered w-full min-h-40 resize-y leading-relaxed",
          error && "textarea-error",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
