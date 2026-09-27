"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Container from "@/components/layout/Container";

const CARD_STYLES = [
  {
    frame: "p-2",
    aspect: "aspect-[4/5]",
    object: "object-[center_20%]",
    shape: "rounded-none",
  },
  {
    frame: "p-3",
    aspect: "aspect-square",
    object: "object-center",
    shape: "rounded-full",
  },
  {
    frame: "p-2.5",
    aspect: "aspect-[3/4]",
    object: "object-[center_30%]",
    shape: "rounded-[2rem]",
  },
  {
    frame: "p-2",
    aspect: "aspect-[5/6]",
    object: "object-[center_15%]",
    shape: "rounded-none rotate-[-1.5deg] group-hover:rotate-0",
  },
];

export default function CategoryShowcase({ categories = [] }) {
  const list = Array.isArray(categories) ? categories.slice(0, 4) : [];

  return (
    <section className="border-t border-base-300/50 py-16 md:py-20">
      <Container>
        <div className="mb-10 flex items-end justify-between gap-4 md:mb-12">
          <div>
            <p className="section-eyebrow">Explore</p>
            <h2 className="section-title mt-2 text-3xl text-base-content md:text-4xl">
              Shop by Category
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

        {!list.length ? (
          <p className="text-sm text-base-content/55">
            No categories yet. Add some from admin.
          </p>
        ) : (
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:max-w-5xl md:grid-cols-4 md:gap-x-6 lg:gap-x-8">
            {list.map((category, index) => {
              const imageUrl = category.image?.url || null;
              const style = CARD_STYLES[index % CARD_STYLES.length];
              const num = String(index + 1).padStart(2, "0");

              return (
                <Link
                  key={category._id}
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div
                    className={`relative w-full max-w-[160px] sm:max-w-[180px] md:max-w-[170px] lg:max-w-[190px] ${style.frame} border border-base-300/80 bg-base-200/40 transition-colors duration-500 group-hover:border-base-content/40`}
                  >
                    <div
                      className={`relative ${style.aspect} w-full overflow-hidden bg-base-300/40 ${style.shape} transition-transform duration-700 ease-out`}
                    >
                      {imageUrl ? (
                        <OptimizedImage
                          src={imageUrl}
                          alt={category.name}
                          fill
                          sizes="190px"
                          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${style.object}`}
                          transformation={[
                            { width: 400, height: 500, quality: 85 },
                          ]}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-base-300 via-base-200 to-secondary/20" />
                      )}

                      <span className="pointer-events-none absolute left-2 top-2 z-10 font-display text-lg font-light text-white/70 drop-shadow-sm sm:text-xl">
                        {num}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 px-1">
                    <h3 className="font-display text-base tracking-wide text-base-content transition-colors group-hover:text-accent sm:text-lg">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.24em] text-base-content/45 transition-colors group-hover:text-base-content/80">
                      Shop
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 transition-all duration-300 group-hover:opacity-100"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
