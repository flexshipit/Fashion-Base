"use client";

export default function ProductSearch({ value, onChange, onSubmit }) {
  return (
    <form
      className="join w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value);
      }}
    >
      <input
        className="input input-bordered join-item w-full"
        placeholder="Search products..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" className="btn btn-primary join-item">
        Search
      </button>
    </form>
  );
}
