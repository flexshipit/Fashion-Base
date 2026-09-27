"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

function normalizeSlides(slides) {
  return (slides || [])
    .map((slide, index) => {
      const image =
        typeof slide.image === "string" ? slide.image : slide.image?.url;
      if (!image) return null;
      return {
        id: slide._id || slide.id || `slide-${index}`,
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        price: slide.price || "",
        buttonText: slide.buttonText || "View Details",
        image,
        link: slide.link || "/products",
      };
    })
    .filter(Boolean);
}

export default function HeroSwiper({ slides = [] }) {
  const resolved = normalizeSlides(slides);

  if (!resolved.length) {
    return (
      <section className="flex h-[50vh] min-h-[320px] w-full items-center justify-center bg-base-200">
        <p className="text-sm opacity-60">
          Add hero slides from the admin Homepage panel.
        </p>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-neutral group">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={resolved.length > 1}
        pagination={{
          el: ".custom-swiper-pagination",
          clickable: true,
          bulletClass: "custom-bullet",
          bulletActiveClass: "custom-bullet-active",
        }}
        navigation={{
          prevEl: ".custom-swiper-prev",
          nextEl: ".custom-swiper-next",
        }}
        className="relative h-[85vh] min-h-[600px] w-full max-h-[900px]"
      >
        {resolved.map((slide) => (
          <SwiperSlide key={slide.id} className="relative h-full w-full">
            <div className="relative h-full w-full">
              <OptimizedImage
                src={slide.image}
                alt={slide.title}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
                transformation={[{ width: 1920, height: 1080, quality: 90 }]}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            </div>

            <div className="absolute bottom-12 left-6 z-10 max-w-xl text-white sm:bottom-14 sm:left-10 md:bottom-16 md:left-14 lg:max-w-2xl">
              <div className="space-y-3">
                {slide.subtitle ? (
                  <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-md sm:text-xs">
                    {slide.subtitle}
                  </span>
                ) : null}

                {slide.title ? (
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl text-balance">
                    {slide.title}
                  </h1>
                ) : null}

                <div className="flex items-center gap-5 pt-2">
                  {slide.price ? (
                    <div className="flex flex-col rounded-sm bg-black/45 px-3 py-1.5 backdrop-blur-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
                        Price
                      </span>
                      <span className="text-2xl font-semibold tracking-tight text-[#f7f1e4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl">
                        {slide.price}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3">
                    <Link
                      href={slide.link}
                      className="btn btn-primary rounded-full px-5 text-xs font-semibold sm:px-7 sm:text-sm"
                    >
                      {slide.buttonText}
                    </Link>
                    <Link
                      href="/products"
                      className="btn btn-outline border-white/30 text-white rounded-full transition-all duration-300 hover:border-white hover:bg-white hover:text-black text-xs sm:text-sm"
                    >
                      Explore Line
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <button
          type="button"
          aria-label="Previous slide"
          className="custom-swiper-prev absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white hover:bg-black/70 opacity-0 group-hover:opacity-100 hidden sm:flex cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="custom-swiper-next absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white hover:bg-black/70 opacity-0 group-hover:opacity-100 hidden sm:flex cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>

        <div className="custom-swiper-pagination pointer-events-auto absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center gap-2" />
      </Swiper>

      <style jsx global>{`
        .custom-swiper-pagination {
          position: absolute !important;
          width: auto !important;
        }

        .custom-bullet {
          display: inline-block;
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer !important;
          pointer-events: auto !important;
        }

        .custom-bullet:hover {
          background-color: rgba(255, 255, 255, 0.8);
          transform: scale(1.2);
        }

        .custom-bullet-active {
          width: 32px;
          background-color: #f7f1e4;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  );
}
