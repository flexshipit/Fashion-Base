"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Container from "@/components/layout/Container";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function SpecialCollections({ collections = [] }) {
  const items = (collections || []).filter(
    (item) => item?.image?.url || item?.image,
  );

  if (!items.length) return null;

  return (
    <section className="border-t border-base-300/50 py-10 md:py-20">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-3 md:mb-12">
          <div>
            <p className="section-eyebrow">Curated</p>
            <h2 className="section-title mt-2 text-3xl text-base-content md:text-4xl">
              Special Collections
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous collection"
              className="collections-prev flex h-10 w-10 items-center justify-center border border-base-300 text-base-content transition hover:border-base-content hover:bg-base-content hover:text-base-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next collection"
              className="collections-next flex h-10 w-10 items-center justify-center border border-base-300 text-base-content transition hover:border-base-content hover:bg-base-content hover:text-base-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={12}
            slidesPerView={1.08}
            centeredSlides={false}
            grabCursor
            speed={650}
            pagination={{
              el: ".collections-pagination",
              clickable: true,
              bulletClass: "collections-bullet",
              bulletActiveClass: "collections-bullet-active",
            }}
            navigation={{
              prevEl: ".collections-prev",
              nextEl: ".collections-next",
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 18,
              },
            }}
            className="overflow-hidden"
          >
            {items.map((item) => {
              const imageUrl =
                typeof item.image === "string" ? item.image : item.image?.url;
              const href = item.link || "/products";
              const key = item._id || item.title || href;

              return (
                <SwiperSlide key={key} className="!h-auto">
                  <Link
                    href={href}
                    className="group relative block h-[300px] w-full overflow-hidden bg-neutral sm:h-[340px] md:h-[360px] lg:h-[380px]"
                  >
                    {imageUrl ? (
                      <OptimizedImage
                        src={imageUrl}
                        alt={item.title || "Collection"}
                        fill
                        sizes="(max-width: 640px) 90vw, 42vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        transformation={[
                          { width: 720, height: 900, quality: 85 },
                        ]}
                      />
                    ) : null}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-8 pt-12 text-center text-white sm:pb-9">
                      <h3 className="font-display text-base font-normal tracking-[0.04em] sm:text-lg md:text-xl">
                        {item.title}
                      </h3>
                      <span className="mt-3 inline-flex items-center border border-white/75 bg-black/30 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white group-hover:text-black sm:text-[11px]">
                        {item.buttonText || "Shop Now"}
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="collections-pagination mt-6 flex justify-center gap-2 sm:hidden" />
        </div>
      </Container>

      <style jsx global>{`
        .collections-bullet {
          display: inline-block;
          width: 7px;
          height: 7px;
          background-color: color-mix(
            in oklab,
            var(--color-base-content) 28%,
            transparent
          );
          border-radius: 9999px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .collections-bullet-active {
          width: 22px;
          background-color: var(--color-base-content);
        }
      `}</style>
    </section>
  );
}
