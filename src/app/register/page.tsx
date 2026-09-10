"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordField } from "@/components/ui/PasswordField";
import { PlatformAuthShell } from "@/components/platform/PlatformChrome";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

function buildSuggestions(clubName: string, currentSlug: string): string[] {
  const base = slugify(clubName);
  if (!base) return ["my-club", "gaming-club", "esports-hq", "play-zone"];

  const candidates = [
    base,
    `${base}-club`,
    `${base}-gg`,
    `${base}-esports`,
    `${base}-hq`,
    `${base}-official`,
    `team-${base}`,
    `${base}-gaming`,
  ];

  return [...new Set(candidates)]
    .filter((s) => s.length >= 2 && s !== currentSlug)
    .slice(0, 6);
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clubName, setClubName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugMessage, setSlugMessage] = useState<string | null>(null);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);

  const localSuggestions = useMemo(
    () => buildSuggestions(clubName, slug),
    [clubName, slug],
  );

  const suggestions = useMemo(() => {
    const merged = [...apiSuggestions, ...localSuggestions];
    return [...new Set(merged)].filter((s) => s !== slug).slice(0, 6);
  }, [apiSuggestions, localSuggestions, slug]);

  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 2) {
      setSlugAvailable(null);
      setSlugMessage(null);
      setApiSuggestions([]);
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      setSlugAvailable(false);
      setSlugMessage("Use lowercase letters, numbers, and hyphens only");
      setApiSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) {
        setSlugAvailable(null);
        setSlugMessage(
          res.status === 429
            ? "Checking too fast — try again in a moment."
            : (data.error ?? "Can't check this name right now. Try again in a moment."),
        );
        setApiSuggestions([]);
        return;
      }
      if (data.available) {
        setSlugAvailable(true);
        setSlugMessage("Available");
        setApiSuggestions([]);
      } else {
        setSlugAvailable(false);
        setSlugMessage("Already taken — try a suggestion below");
        setApiSuggestions((data.suggestions as string[]) ?? []);
      }
    } catch {
      setSlugAvailable(null);
      setSlugMessage(null);
      setApiSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    const timer = setTimeout(() => {
      void checkSlug(slug);
    }, 350);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  function applySuggestion(value: string) {
    setSlugTouched(true);
    setSlug(value);
    void checkSlug(value);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSlugMessage(null);
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
        setError(
          data.error ?? "Could not create your account. Please try again.",
        );
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Can't connect right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlatformAuthShell>
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white p-6 text-zinc-900 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Create your website</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Register a club workspace with its own website address and trial.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          name="fullName"
          required
          autoComplete="name"
          placeholder="Full name"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
        <PasswordField
          autoComplete="new-password"
          placeholder="Password (min 8)"
          minLength={8}
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
              setSlug(slugify(value));
            }
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
        <div>
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
            placeholder="Website slug (e.g. cricket-club)"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className={`w-full rounded-md border bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 ${
              slugAvailable === true
                ? "border-emerald-400"
                : slugAvailable === false
                  ? "border-rose-400"
                  : "border-zinc-300"
            }`}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Your website link:{" "}
            <span className="font-medium text-zinc-700">
              /club/{slug || "your-name"}
            </span>
          </p>
          {slugMessage ? (
            <p
              className={`mt-1 text-xs ${
                slugAvailable === true
                  ? "text-emerald-600"
                  : slugAvailable === false
                    ? "text-rose-600"
                    : "text-zinc-500"
              }`}
            >
              {slugMessage}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-400">
              Pick a short name with letters and numbers. This becomes your website address.
            </p>
          )}

          {suggestions.length > 0 ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-zinc-600">
                Suggestions — click to use
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => applySuggestion(item)}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-xs text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
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
    </div>
    </PlatformAuthShell>
  );
}
