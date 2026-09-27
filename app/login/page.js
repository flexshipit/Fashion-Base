"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/queries/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const user = await login({ email, password });
    router.push(user?.role === "admin" ? "/admin" : "/");
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-base-300 bg-base-100 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm opacity-70">Welcome back to FlexShop</p>
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" loading={isLoggingIn} className="w-full">
          Login
        </Button>

        <p className="text-center text-sm">
          No account?{" "}
          <Link href="/register" className="link link-primary">
            Register
          </Link>
        </p>
      </form>
    </Container>
  );
}
