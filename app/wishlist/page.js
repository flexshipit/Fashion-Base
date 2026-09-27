"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import ProductCard from "@/components/product/ProductCard";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/hooks/queries/useWishlist";

export default function WishlistPage() {
  const { products, isLoading } = useWishlist();

  return (
    <Container className="space-y-6 py-10">
      <div>
        <h1 className="text-3xl font-bold">Wishlist</h1>
        <p className="text-sm opacity-70">Saved products for later.</p>
      </div>

      {isLoading ? <Loading /> : null}

      {!isLoading && !products.length ? (
        <EmptyState
          title="Wishlist is empty"
          description="Tap the heart icon on products to save them."
          actionHref="/products"
          actionLabel="Browse products"
        />
      ) : null}

      {products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) =>
            product ? <ProductCard key={product._id} product={product} /> : null,
          )}
        </div>
      ) : null}

      {products.length ? (
        <Link href="/products" className="link link-primary text-sm">
          Find more products
        </Link>
      ) : null}
    </Container>
  );
}
