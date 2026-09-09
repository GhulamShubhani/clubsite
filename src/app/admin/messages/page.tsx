"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminEmptyState,
  AdminListSkeleton,
} from "@/components/admin/AdminSkeleton";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

function parseDetails(raw: string) {
  const lines = raw.split("\n");
  let formTitle: string | null = null;
  let phone: string | null = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.startsWith("Form: ")) {
      formTitle = line.slice(6);
      i += 1;
      continue;
    }
    if (line.startsWith("Phone: ")) {
      phone = line.slice(7);
      i += 1;
      continue;
    }
    if (line.trim() === "") {
      i += 1;
      break;
    }
    break;
  }
  return {
    formTitle,
    phone,
    message: lines.slice(i).join("\n").trim() || raw,
  };
}

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/contact/inbox");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load messages");
        setMessages([]);
        return;
      }
      setMessages(data.messages ?? []);
    } catch {
      setError("Could not load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    setError(null);
    const res = await fetch(
      `/api/contact/inbox?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not delete");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Messages from your website
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            When someone fills a form on your live website (Contact, join, or
            registration), it appears here. No coding needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Check for new messages
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <AdminListSkeleton rows={4} />
      ) : messages.length === 0 ? (
        <AdminEmptyState
          title="No messages yet"
          description="Open your live website, go to the Contact page, send a test message, then click “Check for new messages”."
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const details = parseDetails(m.message);
            return (
            <li
              key={m.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {details.formTitle ? (
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {details.formTitle}
                    </p>
                  ) : null}
                  <p className="font-medium text-zinc-900">{m.name}</p>
                  <p className="text-sm text-zinc-500">
                    <a
                      href={`mailto:${m.email}`}
                      className="underline hover:text-zinc-800"
                    >
                      {m.email}
                    </a>
                  </p>
                  {details.phone ? (
                    <p className="text-sm text-zinc-500">
                      <a
                        href={`tel:${details.phone}`}
                        className="underline hover:text-zinc-800"
                      >
                        {details.phone}
                      </a>
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-zinc-500">
                    {formatWhen(m.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => void onDelete(m.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">
                {details.message}
              </p>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
