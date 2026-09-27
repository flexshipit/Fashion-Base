export default function Container({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-[1800px] px-6 sm:px-10 lg:px-16 ${className}`}
    >
      {children}
    </div>
  );
}
