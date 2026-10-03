// "use client";

// import Link from "next/link";
// import { Heart } from "lucide-react";
// import OptimizedImage from "@/components/ui/OptimizedImage";
// import { useWishlist } from "@/hooks/queries/useWishlist";

// export default function ProductCard({ product }) {
//   const { has, add, remove } = useWishlist();
//   const id = product._id;
//   const liked = has(id);
//   const image = product.images?.[0]?.url || product.images?.[0] || null;
//   const slug = typeof product.slug === "string" ? product.slug : "";
//   const href = slug ? `/products/${slug}` : "#";
//   const price = product.salePrice ?? product.variants?.[0]?.salePrice ?? 0;
//   const original = product.originalPrice ?? product.variants?.[0]?.originalPrice;

//   return (
//     <article className="group overflow-hidden rounded-2xl border border-base-300 bg-base-100 transition hover:border-primary/40">
//       <Link href={href} className="block">
//         <div className="relative aspect-[4/5] overflow-hidden bg-base-200">
//           {image ? (
//             <OptimizedImage
//               src={image}
//               alt={product.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
//               className="object-cover transition duration-500 group-hover:scale-105"
//               transformation={[{ width: 600, height: 750, quality: 80 }]}
//             />
//           ) : (
//             <div className="flex h-full items-center justify-center text-sm opacity-50">
//               No image
//             </div>
//           )}
//         </div>
//       </Link>

//       <div className="space-y-2 p-4">
//         <div className="flex items-start justify-between gap-2">
//           <Link href={href} className="font-medium leading-snug hover:text-primary">
//             {product.name}
//           </Link>
//           <button
//             type="button"
//             className="btn btn-ghost btn-xs btn-circle"
//             onClick={() => (liked ? remove(id) : add(id))}
//             aria-label="Toggle wishlist"
//           >
//             <Heart size={16} className={liked ? "fill-error text-error" : ""} />
//           </button>
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="font-semibold">৳{price}</span>
//           {original && original > price ? (
//             <span className="text-sm line-through opacity-50">৳{original}</span>
//           ) : null}
//         </div>
//       </div>
//     </article>
//   );
// }

"use client";

import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useWishlist } from "@/hooks/queries/useWishlist";

export default function ProductCard({ product }) {
  const { has, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  const id = product._id;
  const liked = has(id);

  // Primary and secondary hover image extraction
  const imagePrimary = product.images?.[0]?.url || product.images?.[0] || null;
  const imageSecondary =
    product.images?.[1]?.url || product.images?.[1] || null;

  const slug = typeof product.slug === "string" ? product.slug : "";
  const href = slug ? `/products/${slug}` : "#";
  const price = product.salePrice ?? product.variants?.[0]?.salePrice ?? 0;
  const original =
    product.originalPrice ?? product.variants?.[0]?.originalPrice;

  return (
    <article className="group relative flex min-w-0 w-full flex-col transition-all duration-500">
      {/* COMPACT IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-base-200/50 border border-base-300/50 transition-colors duration-500 group-hover:border-base-content/30">
        <Link href={href} className="block h-full w-full relative">
          {imagePrimary ? (
            <>
              {/* Main Image */}
              <OptimizedImage
                src={imagePrimary}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                className={`object-cover object-center transition-all duration-700 ease-out ${
                  imageSecondary
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-110"
                }`}
                transformation={[{ width: 500, height: 625, quality: 85 }]}
              />

              {/* Secondary Image Reveal on Hover (if available) */}
              {imageSecondary && (
                <OptimizedImage
                  src={imageSecondary}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover object-center absolute inset-0 opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                  transformation={[{ width: 500, height: 625, quality: 85 }]}
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] tracking-widest uppercase text-base-content/30">
              No Preview
            </div>
          )}
        </Link>

        {/* WISHLIST BUTTON (Minimal Floating Top Right) */}
        <button
          type="button"
          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-base-100/80 text-base-content backdrop-blur-md transition-all duration-300 hover:bg-black hover:text-white"
          onClick={() => (liked ? removeFromWishlist(id) : addToWishlist(id))}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={13}
            className={liked ? "fill-error text-error" : "text-current"}
          />
        </button>

        {/* EDITORIAL HOVER CTA (Navigates to Product Page) */}
        <div className="absolute inset-x-2 bottom-2 z-10 translate-y-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
          <Link
            href={href}
            className="flex w-full items-center justify-center gap-1.5 bg-base-content text-base-100 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase transition-all hover:bg-accent hover:text-accent-content"
          >
            <span>Select Options</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* COMPACT PRODUCT DETAILS */}
      <div className="pt-2.5 pb-1 space-y-1">
        <Link
          href={href}
          className="block font-display text-sm tracking-wide text-base-content line-clamp-1 hover:text-accent transition-colors"
        >
          {product.name}
        </Link>

        {/* PRICE DISPLAY */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-base-content">
            ৳{price}
          </span>
          {original && original > price ? (
            <span className="text-xs line-through text-base-content/65">
              ৳{original}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
