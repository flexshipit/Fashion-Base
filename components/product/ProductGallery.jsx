"use client";

import { useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function ProductGallery({ images = [], name = "Product" }) {
  const list = images.length ? images : [{ url: null }];
  const [active, setActive] = useState(0);
  const current = list[active]?.url || list[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-base-200">
        {current ? (
          <OptimizedImage
            src={current}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            transformation={[{ width: 1000, height: 1000, quality: 85 }]}
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center opacity-50">
            No image
          </div>
        )}
      </div>

      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {list.map((image, index) => {
            const src = image?.url || image;
            return (
              <button
                key={index}
                type="button"
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
                  active === index ? "border-primary" : "border-base-300"
                }`}
                onClick={() => setActive(index)}
              >
                {src ? (
                  <OptimizedImage
                    src={src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    transformation={[{ width: 128, height: 128, quality: 70 }]}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
