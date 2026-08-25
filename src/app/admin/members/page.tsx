"use client";

import { useCallback, useEffect, useState } from "react";

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; fullName: string };
};

const ROLES = ["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const;

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/memberships");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load members");
      return;
    }
    setMembers(data.members ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          role: String(form.get("role") ?? "EDITOR"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invite failed");
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRoleChange(id: string, role: string) {
    setError(null);
    const res = await fetch("/api/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Role update failed");
      await load();
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m)),
    );
  }

  async function onRemove(id: string) {
    if (!confirm("Remove this member?")) return;
    setError(null);
    const res = await fetch(`/api/memberships?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Remove failed");
      return;
    }
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Team members</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        onSubmit={onInvite}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Role</span>
          <select
            name="role"
            defaultValue="EDITOR"
            className="rounded-md border border-zinc-300 px-3 py-2"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Invite
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-zinc-900">{m.user.fullName}</p>
              <p className="text-zinc-500">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={m.role}
                onChange={(e) => void onRoleChange(m.id, e.target.value)}
                className="rounded-md border border-zinc-300 px-2 py-1"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void onRemove(m.id)}
                className="text-red-600 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
