// "use client";

// import { useState } from "react";
// import ProductGallery from "@/components/product/ProductGallery";
// import VariantSelector from "@/components/product/VariantSelector";
// import Button from "@/components/ui/Button";
// import { useCart } from "@/hooks/queries/useCart";
// import { useWishlist } from "@/hooks/queries/useWishlist";
// import { useReviews } from "@/hooks/queries/useReviews";

// export default function ProductDetails({ product }) {
//   const { addItem } = useCart();
//   const { has, add, remove } = useWishlist();
//   const { data: reviews = [], isLoading: reviewsLoading } = useReviews(
//     product.slug,
//   );
//   const hasVariants = (product.variants || []).length > 0;
//   const [variant, setVariant] = useState(
//     () => (product.variants || []).find((item) => item.isActive !== false) || null,
//   );
//   const [quantity, setQuantity] = useState(1);

//   const price = hasVariants
//     ? (variant?.salePrice ?? 0)
//     : (product.salePrice ?? 0);

//   const original = hasVariants
//     ? variant?.originalPrice
//     : product.originalPrice;

//   const stock = hasVariants ? (variant?.stock ?? 0) : (product.stock ?? 0);
//   const liked = has(product._id);
//   const outOfStock = stock <= 0;

//   return (
//     <div className="space-y-10">
//       <div className="grid gap-8 lg:grid-cols-2">
//         <ProductGallery
//           images={
//             (variant?.images?.length ? variant.images : null) || product.images
//           }
//           name={product.name}
//         />

//         <div className="space-y-5">
//           <div>
//             <p className="text-sm uppercase tracking-wide opacity-60">
//               {product.category?.name || "Product"}
//             </p>
//             <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
//             {product.reviewCount > 0 ? (
//               <p className="mt-1 text-sm opacity-70">
//                 {product.rating?.toFixed?.(1) ?? product.rating} ·{" "}
//                 {product.reviewCount} review
//                 {product.reviewCount === 1 ? "" : "s"}
//               </p>
//             ) : null}
//           </div>

//           <div className="flex items-center gap-3">
//             <span className="text-2xl font-semibold">৳{price}</span>
//             {original && original > price ? (
//               <span className="text-lg line-through opacity-50">
//                 ৳{original}
//               </span>
//             ) : null}
//           </div>

//           <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">
//             {product.description || "No description provided."}
//           </p>

//           <VariantSelector
//             variants={product.variants || []}
//             selectedVariantId={variant?._id}
//             onChange={setVariant}
//           />

//           <p className="text-sm opacity-70">
//             {outOfStock ? "Out of stock" : `${stock} in stock`}
//           </p>

//           <div className="flex items-center gap-3">
//             <input
//               type="number"
//               min={1}
//               max={Math.max(1, stock)}
//               className="input input-bordered w-24"
//               value={quantity}
//               onChange={(event) =>
//                 setQuantity(Number(event.target.value) || 1)
//               }
//             />
//             <Button
//               disabled={outOfStock || (hasVariants && !variant)}
//               onClick={() =>
//                 addItem({
//                   productId: product._id,
//                   variantId: variant?._id || null,
//                   quantity: Math.max(1, Math.trunc(Number(quantity) || 1)),
//                 })
//               }
//             >
//               Add to cart
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => (liked ? remove(product._id) : add(product._id))}
//             >
//               {liked ? "Wishlisted" : "Wishlist"}
//             </Button>
//           </div>
//         </div>
//       </div>

//       <section className="space-y-4">
//         <h2 className="text-xl font-semibold">Reviews</h2>
//         {reviewsLoading ? (
//           <p className="text-sm opacity-70">Loading reviews...</p>
//         ) : null}
//         {!reviewsLoading && !reviews.length ? (
//           <p className="text-sm opacity-70">No reviews yet.</p>
//         ) : null}
//         <div className="space-y-3">
//           {reviews.map((review) => (
//             <article
//               key={review._id}
//               className="rounded-2xl border border-base-300 bg-base-100 p-4"
//             >
//               <div className="flex flex-wrap items-center justify-between gap-2">
//                 <p className="font-medium">
//                   {review.user?.name || "Customer"}
//                 </p>
//                 <p className="text-sm opacity-70">{review.rating}/5</p>
//               </div>
//               {review.title ? (
//                 <p className="mt-1 text-sm font-medium">{review.title}</p>
//               ) : null}
//               <p className="mt-1 text-sm opacity-80">{review.comment}</p>
//             </article>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ChevronDown,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import VariantSelector from "@/components/product/VariantSelector";
import { useCart } from "@/hooks/queries/useCart";
import { useWishlist } from "@/hooks/queries/useWishlist";
import { useReviews } from "@/hooks/queries/useReviews";

export default function ProductDetails({ product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, add, remove } = useWishlist();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(
    product.slug,
  );

  const hasVariants = (product.variants || []).length > 0;
  const [variant, setVariant] = useState(
    () =>
      (product.variants || []).find((item) => item.isActive !== false) || null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Gallery & Zoom States
  const galleryImages =
    (variant?.images?.length ? variant.images : null) || product.images || [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const price = hasVariants
    ? (variant?.salePrice ?? 0)
    : (product.salePrice ?? 0);

  const original = hasVariants ? variant?.originalPrice : product.originalPrice;

  const stock = hasVariants ? (variant?.stock ?? 0) : (product.stock ?? 0);
  const liked = has(product._id);
  const outOfStock = stock <= 0;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > Math.max(1, stock)) return stock;
      return next;
    });
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleBuyNow = async () => {
    if (outOfStock || (hasVariants && !variant)) return;

    await addItem({
      productId: product._id,
      variantId: variant?._id || null,
      quantity: Math.max(1, Math.trunc(Number(quantity) || 1)),
    });

    router.push("/checkout");
  };

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  return (
    <div className="w-full pb-24 px-4 sm:px-8 lg:px-12 max-w-[1400px] mx-auto font-sans">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
        {/* LEFT COLUMN: COMPACT MULTI-IMAGE GALLERY WITH HOVER ZOOM */}
        <div className="lg:col-span-6 space-y-3">
          {/* Main Display Frame */}
          <div
            className="relative w-full max-w-xl mx-auto aspect-square sm:aspect-[4/3] lg:aspect-square bg-base-200 overflow-hidden cursor-crosshair group border border-base-300 rounded-sm"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            {currentImage?.url ? (
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed ? "scale(2)" : "scale(1)",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/40 text-sm uppercase tracking-widest">
                Image Unavailable
              </div>
            )}

            {/* Expand Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3 right-3 z-10 p-2.5 bg-white/80 hover:bg-white text-black rounded-full shadow-md backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Enlarge image"
            >
              <Maximize2 size={16} />
            </button>

            {/* Hover Hint Badge */}
            <div className="absolute bottom-3 left-3 z-10 px-3 py-1 bg-black/60 text-white text-xs font-medium tracking-widest uppercase rounded-full backdrop-blur-sm pointer-events-none transition-opacity group-hover:opacity-0">
              Hover to Zoom
            </div>
          </div>

          {/* All Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin max-w-xl mx-auto">
              {galleryImages.map((img, idx) => (
                <button
                  key={img._id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative flex-shrink-0 w-14 h-16 sm:w-16 sm:h-20 border transition-all overflow-hidden rounded-sm ${
                    selectedImageIndex === idx
                      ? "border-black ring-1 ring-black"
                      : "border-base-300 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY LUXURY DETAILS PANEL */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 h-fit space-y-6">
          {/* CATEGORY & TITLE */}
          <div className="space-y-3 border-b border-base-300/80 pb-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/60">
                {product.category?.name || "Haute Couture"}
              </span>
              {stock > 0 && stock <= 5 && (
                <span className="text-xs font-bold tracking-widest text-warning uppercase bg-warning/10 px-3 py-1 rounded-full">
                  Only {stock} Remaining
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-base-content leading-tight">
              {product.name}
            </h1>

            {/* RATING */}
            <div className="flex items-center gap-3 pt-1">
              {product.reviewCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    <Star size={18} className="fill-current" />
                  </div>
                  <span className="text-base font-semibold">
                    {product.rating?.toFixed?.(1) ?? product.rating}
                  </span>
                  <span className="text-sm text-base-content/60">
                    ({product.reviewCount}{" "}
                    {product.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold tracking-widest uppercase text-base-content/50">
                  New Season Collection
                </span>
              )}
            </div>

            {/* PRICE */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-base-content">
                ৳{price.toLocaleString()}
              </span>
              {original && original > price ? (
                <span className="text-lg line-through text-base-content/40 font-light">
                  ৳{original.toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>

          {/* VARIANTS & ACTIONS */}
          <div className="space-y-5">
            <VariantSelector
              variants={product.variants || []}
              selectedVariantId={variant?._id}
              onChange={setVariant}
            />

            {/* QUANTITY & ACTIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-base-content/80">
                  Select Quantity
                </span>
                <span className="text-xs text-base-content/60 font-medium">
                  {outOfStock ? "Currently Unavailable" : `In Stock: ${stock}`}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="flex h-12 w-36 items-center justify-between border border-base-300 px-3 bg-base-100">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || outOfStock}
                    className="p-1 text-base-content/70 hover:text-base-content disabled:opacity-20"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-base font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stock || outOfStock}
                    className="p-1 text-base-content/70 hover:text-base-content disabled:opacity-20"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* WISHLIST BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    liked ? remove(product._id) : add(product._id)
                  }
                  className="flex h-12 w-14 items-center justify-center border border-base-300 transition-colors hover:border-black hover:bg-black hover:text-white"
                  aria-label="Toggle Wishlist"
                >
                  <Heart
                    size={20}
                    className={liked ? "fill-error text-error" : "text-current"}
                  />
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={outOfStock || (hasVariants && !variant)}
                  onClick={() =>
                    addItem({
                      productId: product._id,
                      variantId: variant?._id || null,
                      quantity: Math.max(1, Math.trunc(Number(quantity) || 1)),
                    })
                  }
                  className="flex h-13 items-center justify-center gap-2 border border-black bg-transparent text-black text-sm font-bold uppercase tracking-[0.18em] transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-base-300 disabled:text-base-content/30"
                >
                  <ShoppingBag size={18} />
                  Add to Bag
                </button>

                <button
                  type="button"
                  disabled={outOfStock || (hasVariants && !variant)}
                  onClick={handleBuyNow}
                  className="flex h-13 items-center justify-center gap-2 bg-black text-white text-sm font-bold uppercase tracking-[0.18em] transition-all hover:bg-primary hover:text-primary-content shadow-md disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/30"
                >
                  <Zap size={18} className="fill-current" />
                  Instant Buy
                </button>
              </div>
            </div>
          </div>

          {/* LUXURY SERVICE GUARANTEES */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-base-300/80 py-4 text-center">
            <div className="flex flex-col items-center gap-1.5 p-1">
              <Truck size={20} className="text-base-content/80" />
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                Express Delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 border-x border-base-300/80">
              <ShieldCheck size={20} className="text-base-content/80" />
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                100% Authentic
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1">
              <RotateCcw size={20} className="text-base-content/80" />
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                Easy Returns
              </span>
            </div>
          </div>

          {/* EDITORIAL ACCORDIONS */}
          <div className="space-y-2 pt-1">
            <div className="border-b border-base-300/80 pb-3">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "description" ? "" : "description")
                }
                className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-base-content"
              >
                <span>Product Overview & Details</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    activeTab === "description" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeTab === "description" && (
                <div className="pt-2 text-sm leading-relaxed text-base-content/80 space-y-3 whitespace-pre-line">
                  {product.description ||
                    "No specific details provided for this item."}
                </div>
              )}
            </div>

            <div className="border-b border-base-300/80 pb-3">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "shipping" ? "" : "shipping")
                }
                className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-base-content"
              >
                <span>Complimentary Shipping & Returns</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    activeTab === "shipping" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeTab === "shipping" && (
                <div className="pt-2 text-sm leading-relaxed text-base-content/80 space-y-2">
                  <p>• Fast delivery in Dhaka within 24–48 hours.</p>
                  <p>
                    • Nationwide insured shipping across Bangladesh in 3–5 days.
                  </p>
                  <p>• 7-day return guarantee in unused original packaging.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-10">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full"
            aria-label="Close fullscreen"
          >
            <X size={28} />
          </button>

          <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
            {currentImage?.url && (
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev === 0 ? galleryImages.length - 1 : prev - 1,
                  )
                }
                className="absolute left-6 text-white/80 hover:text-white p-3 bg-white/10 rounded-full"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev === galleryImages.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-6 text-white/80 hover:text-white p-3 bg-white/10 rounded-full"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}

      {/* REVIEWS SECTION */}
      <section className="mt-20 border-t border-base-300/80 pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-base-content">
              Client Feedback
            </h2>
            <p className="text-xs text-base-content/60 uppercase tracking-widest mt-1 font-medium">
              {reviews.length} Verified Reviews
            </p>
          </div>
        </div>

        {reviewsLoading ? (
          <div className="py-12 text-center text-xs uppercase tracking-widest text-base-content/50">
            Fetching reviews...
          </div>
        ) : null}

        {!reviewsLoading && !reviews.length ? (
          <div className="py-14 border border-dashed border-base-300 text-center text-xs tracking-widest text-base-content/60 uppercase">
            No client reviews recorded for this product yet.
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="flex flex-col justify-between border border-base-300/80 p-6 bg-base-100 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm tracking-tight text-base-content">
                    {review.user?.name || "Verified Customer"}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} className="fill-current" />
                    <span className="text-xs font-bold text-base-content">
                      {review.rating}
                    </span>
                  </div>
                </div>
                {review.title && (
                  <h3 className="text-sm font-semibold text-base-content">
                    {review.title}
                  </h3>
                )}
                <p className="text-xs leading-relaxed text-base-content/80">
                  {review.comment}
                </p>
              </div>

              <div className="pt-3 border-t border-base-200 text-xs uppercase tracking-widest text-base-content/50 font-medium">
                Verified Purchase
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
