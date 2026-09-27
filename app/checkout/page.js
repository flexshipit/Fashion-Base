"use client";

import Container from "@/components/layout/Container";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <Container className="space-y-6 py-10">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-sm opacity-70">Confirm delivery and payment details.</p>
      </div>
      <CheckoutForm />
    </Container>
  );
}
