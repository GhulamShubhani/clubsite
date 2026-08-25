"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clubName, setClubName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<string | null>(null);

  const suggested = useMemo(() => slugify(clubName), [clubName]);

  async function checkSlug(value: string) {
    if (!value || value.length < 2) {
      setSlugStatus(null);
      return;
    }
    try {
      const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) {
        setSlugStatus("Invalid slug format");
        return;
      }
      if (data.available) {
        setSlugStatus("Available");
      } else {
        setSlugStatus(
          `Taken. Try: ${(data.suggestions as string[])?.slice(0, 3).join(", ") || "another name"}`,
        );
      }
    } catch {
      setSlugStatus(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      clubName: String(form.get("clubName") ?? ""),
      slug: String(form.get("slug") ?? ""),
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Create your website</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Register a club workspace with its own subdomain and trial.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          name="fullName"
          required
          autoComplete="name"
          placeholder="Full name"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Password (min 8)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="clubName"
          required
          placeholder="Club name"
          value={clubName}
          onChange={(e) => {
            const value = e.target.value;
            setClubName(value);
            if (!slugTouched) {
              const next = slugify(value);
              setSlug(next);
              void checkSlug(next);
            }
          }}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <div>
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
            placeholder="Website slug (e.g. abc-gaming)"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              const value = slugify(e.target.value);
              setSlug(value);
              void checkSlug(value);
            }}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Site: {slug || suggested || "your-slug"}.localhost:3000
            {slugStatus ? ` · ${slugStatus}` : ""}
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
