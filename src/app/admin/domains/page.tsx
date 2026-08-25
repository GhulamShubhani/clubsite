"use client";

import { useCallback, useEffect, useState } from "react";

type Domain = {
  id: string;
  hostname: string;
  isPrimary: boolean;
  isCustom: boolean;
  verifiedAt: string | null;
};

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/domains");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load domains");
      return;
    }
    setDomains(data.domains ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("add");
    setError(null);
    const hostname = String(
      new FormData(e.currentTarget).get("hostname") ?? "",
    ).trim();
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Add failed");
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add failed");
    } finally {
      setBusy(null);
    }
  }

  async function onVerify(id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verify failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Domains</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        onSubmit={onAdd}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Custom hostname</span>
          <input
            name="hostname"
            required
            placeholder="www.example.com"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={busy === "add"}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Add domain
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {domains.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-zinc-900">{d.hostname}</p>
              <p className="text-zinc-500">
                {d.isPrimary ? "Primary · " : ""}
                {d.isCustom ? "Custom · " : "Subdomain · "}
                {d.verifiedAt ? "Verified" : "Unverified"}
              </p>
            </div>
            {!d.verifiedAt && (
              <button
                type="button"
                disabled={busy === d.id}
                onClick={() => void onVerify(d.id)}
                className="text-zinc-700 underline disabled:opacity-50"
              >
                Verify
              </button>
            )}
          </li>
        ))}
        {domains.length === 0 && (
          <li className="px-4 py-6 text-sm text-zinc-500">No domains yet.</li>
        )}
      </ul>
    </div>
  );
}
