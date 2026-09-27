"use client";

import { useParams } from "next/navigation";
import Container from "@/components/layout/Container";
import ProductDetails from "@/components/product/ProductDetails";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import { useProduct } from "@/hooks/queries/useProducts";

export default function ProductPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);

  return (
    <Container className="py-10">
      {isLoading ? <Loading /> : null}
      {isError ? <ErrorState message={error.message} onRetry={refetch} /> : null}
      {product ? <ProductDetails product={product} /> : null}
    </Container>
  );
}
