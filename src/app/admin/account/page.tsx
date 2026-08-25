"use client";

import { useEffect, useState } from "react";

export default function AdminAccountPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/account");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load account");
        return;
      }
      setFullName(data.user?.fullName ?? "");
      setEmail(data.user?.email ?? "");
      setRole(data.role ?? null);
      setTenantName(data.tenant?.name ?? null);
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const body: Record<string, string> = { fullName };
      if (currentPassword || newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setFullName(data.user.fullName);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Account updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Account</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <p className="text-sm text-zinc-600">
          Email: <span className="text-zinc-900">{email || "—"}</span>
        </p>
        {tenantName && (
          <p className="text-sm text-zinc-600">
            Club: <span className="text-zinc-900">{tenantName}</span>
            {role ? ` · ${role}` : ""}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
