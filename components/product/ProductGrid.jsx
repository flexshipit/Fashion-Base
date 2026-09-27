import ProductCard from "@/components/product/ProductCard";

export default function ProductGrid({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
