"use client";

import { useState, type FormEvent } from "react";

type Props = {
  submitLabel?: string;
};

export function ContactForm({ submitLabel = "Send message" }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Failed to send message");
        return;
      }
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setError("Failed to send message");
    }
  }

  return (
    <form className="mx-auto max-w-md space-y-3" onSubmit={onSubmit}>
      <input
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Name"
        name="name"
        required
        disabled={status === "sending"}
      />
      <input
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Email"
        name="email"
        type="email"
        required
        disabled={status === "sending"}
      />
      <textarea
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Message"
        name="message"
        rows={4}
        required
        disabled={status === "sending"}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : submitLabel}
      </button>
      {status === "ok" ? (
        <p className="text-sm text-green-700">Message sent. Thanks!</p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
