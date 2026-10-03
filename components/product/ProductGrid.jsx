import ProductCard from "@/components/product/ProductCard";

export default function ProductGrid({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
