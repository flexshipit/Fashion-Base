"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/layout/Container";
import ProductGrid from "@/components/product/ProductGrid";
import Loading from "@/components/ui/Loading";
import HeroSwiper from "@/components/layout/HeroSwiper";
import SpecialCollections from "@/components/layout/SpecialCollections";
import CategoryShowcase from "@/components/layout/CategoryShowcase";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCategories } from "@/hooks/queries/useCategories";
import { useHomepageContent } from "@/hooks/queries/useHomepage";

export default function HomePage() {
  const { data, isLoading } = useProducts({ limit: 8, sort: "newest" });
  const { data: categories } = useCategories();
  const { data: homepage, isLoading: homepageLoading } = useHomepageContent();

  const products = data?.products || [];
  const categoryList = Array.isArray(categories)
    ? categories
    : categories?.categories || [];
  const heroSlides = homepage?.heroSlides || [];
  const specialCollections = homepage?.specialCollections || [];

  return (
    <div className="bg-base-100">
      {homepageLoading ? (
        <section className="flex h-[50vh] min-h-[320px] w-full items-center justify-center bg-base-200">
          <Loading label="Loading..." />
        </section>
      ) : (
        <HeroSwiper slides={heroSlides} />
      )}

      <CategoryShowcase categories={categoryList} />

      <section className="border-t border-base-300/50 py-16 md:py-20">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4 md:mb-12">
            <div>
              <p className="section-eyebrow">Just in</p>
              <h2 className="section-title mt-2 text-3xl text-base-content md:text-4xl">
                New Arrivals
              </h2>
            </div>
            <Link href="/products" className="section-link group">
              View all
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {isLoading ? <Loading /> : <ProductGrid products={products} />}
          {!isLoading && !products.length ? (
            <p className="text-sm text-base-content/55">
              No products yet. Create products in the admin panel.
            </p>
          ) : null}
        </Container>
      </section>

      {!homepageLoading ? (
        <SpecialCollections collections={specialCollections} />
      ) : null}
    </div>
  );
}
