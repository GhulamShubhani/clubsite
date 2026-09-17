"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { usePublicSite } from "@/components/public/PublicSiteContext";

type Props = {
  submitLabel?: string;
  formTitle?: string;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm";

function slugFromPath(pathname: string) {
  const match = pathname.match(/^\/club\/([^/]+)/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function ContactForm({
  submitLabel = "Send message",
  formTitle = "Contact",
}: Props) {
  const { tenantSlug } = usePublicSite();
  const pathname = usePathname() ?? "";
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
    const slug = tenantSlug || slugFromPath(pathname);
    const body = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      formTitle,
      message: String(fd.get("message") ?? "").trim(),
      ...(slug ? { slug } : {}),
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
        setError(
          data.error && !/internal server error/i.test(data.error)
            ? data.error
            : "Could not send your message. Please try again in a moment.",
        );
        return;
      }
      setStatus("ok");
      formEl.reset();
    } catch {
      setStatus("error");
      setError("Could not send your message. Please try again in a moment.");
    }
  }

  if (status === "ok") {
    return (
      <div
        className="mx-auto max-w-md rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5 text-center"
        role="status"
      >
        <p className="text-base font-semibold text-emerald-900">Thank you</p>
        <p className="mt-1 text-sm text-emerald-800">
          Your message has been sent. We will get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-emerald-900 underline"
        >
          Send another message
        </button>
      </div>
    );
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
      {status === "error" && error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
