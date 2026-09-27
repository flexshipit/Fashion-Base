"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/queries/useAuth";
import { useSiteBrand } from "@/components/layout/SiteBrand";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isRegistering } = useAuth();
  const { siteName } = useSiteBrand();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    await register(form);
    router.push("/login");
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-base-300 bg-base-100 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm text-base-content/80">Join {siteName} in a minute</p>
        </div>

        <Input
          label="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

        <Button type="submit" loading={isRegistering} className="w-full">
          Register
        </Button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="link link-primary">
            Login
          </Link>
        </p>
      </form>
    </Container>
  );
}
