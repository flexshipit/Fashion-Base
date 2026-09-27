"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { useCart } from "@/hooks/queries/useCart";

export default function CartPage() {
  const { cart, items, isLoading, updateItem, removeItem } = useCart();

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-3xl font-bold">Cart</h1>

      {isLoading ? <Loading /> : null}

      {!isLoading && !items.length ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products to continue shopping."
          actionHref="/products"
          actionLabel="Browse products"
        />
      ) : null}

      {items.length ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-base-300 bg-base-100 px-5">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
          <CartSummary
            subtotal={cart?.subtotal || 0}
            itemCount={cart?.totalQuantity || items.length}
          />
        </div>
      ) : null}

      {items.length ? (
        <p className="mt-4 text-sm">
          Need more items?{" "}
          <Link href="/products" className="link link-primary">
            Continue shopping
          </Link>
        </p>
      ) : null}
    </Container>
  );
}
