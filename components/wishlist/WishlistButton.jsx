"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/queries/useWishlist";

export default function WishlistButton({ productId }) {
  const { has, add, remove } = useWishlist();
  const liked = has(productId);

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-circle"
      onClick={() => (liked ? remove(productId) : add(productId))}
      aria-label="Wishlist"
    >
      <Heart size={18} className={liked ? "fill-error text-error" : ""} />
    </button>
  );
}
