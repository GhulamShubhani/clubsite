"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PasswordField } from "@/components/ui/PasswordField";
import { PlatformAuthShell } from "@/components/platform/PlatformChrome";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white p-6 text-zinc-900 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Access your club admin workspace.
        </p>
      </div>
      {registered && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Account created. Sign in to open your admin dashboard.
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
        <PasswordField autoComplete="current-password" placeholder="Password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-zinc-600">
        New club?{" "}
        <Link href="/register" className="underline">
          Create your website
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PlatformAuthShell>
      <Suspense
        fallback={
          <p className="text-center text-sm text-zinc-400">Loading…</p>
        }
      >
        <LoginForm />
      </Suspense>
    </PlatformAuthShell>
  );
}
