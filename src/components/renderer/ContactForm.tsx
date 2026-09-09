"use client";

import { useState, type FormEvent } from "react";
import { usePublicSite } from "@/components/public/PublicSiteContext";

type Props = {
  submitLabel?: string;
  formTitle?: string;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm";

export function ContactForm({
  submitLabel = "Send message",
  formTitle = "Contact",
}: Props) {
  const { tenantSlug } = usePublicSite();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    setError(null);
    const fd = new FormData(formEl);
    const body = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      formTitle,
      message: String(fd.get("message") ?? "").trim(),
      ...(tenantSlug ? { slug: tenantSlug } : {}),
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
        setError(data.error ?? "Could not send. Please try again.");
        return;
      }
      setStatus("ok");
      formEl.reset();
    } catch {
      setStatus("error");
      setError("Could not send. Please try again.");
    }
  }

  return (
    <form className="mx-auto max-w-md space-y-3" onSubmit={onSubmit}>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-600">Your name</span>
        <input
          className={fieldClass}
          placeholder="Name"
          name="name"
          autoComplete="name"
          required
          disabled={status === "sending"}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-600">Email</span>
        <input
          className={fieldClass}
          placeholder="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={status === "sending"}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-600">Phone (optional)</span>
        <input
          className={fieldClass}
          placeholder="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          disabled={status === "sending"}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-600">Message</span>
        <textarea
          className={fieldClass}
          placeholder="Message"
          name="message"
          rows={4}
          required
          disabled={status === "sending"}
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : submitLabel}
      </button>
      {status === "ok" ? (
        <p className="text-sm text-green-700">
          Sent. Thank you — we will get back to you.
        </p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
