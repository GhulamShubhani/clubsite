"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type EventItem = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

const endpoint = "/api/gaming/events";

function formatDate(value: string | null) {
  if (!value) return "Date to be announced";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return "Time to be announced";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function eventState(event: EventItem) {
  if (!event.startsAt) return { label: "Unscheduled", className: "bg-zinc-100 text-zinc-600" };
  const now = Date.now();
  const start = new Date(event.startsAt).getTime();
  const end = event.endsAt ? new Date(event.endsAt).getTime() : start + 2 * 60 * 60 * 1000;
  if (now > end) return { label: "Completed", className: "bg-zinc-100 text-zinc-500" };
  if (now >= start) return { label: "Live now", className: "bg-emerald-100 text-emerald-700" };
  return { label: "Upcoming", className: "bg-sky-100 text-sky-700" };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load events");
      setEvents((data.events as EventItem[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const startsAt = String(form.get("startsAt") ?? "");
    const endsAt = String(form.get("endsAt") ?? "");
    const body = {
      title: String(form.get("title") ?? "").trim(),
      location: String(form.get("location") ?? "").trim() || null,
      description: String(form.get("description") ?? "").trim() || null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create event");
      event.currentTarget.reset();
      setMessage("Event created successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    setError(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete event");
      setEvents((current) => current.filter((item) => item.id !== id));
      setMessage("Event deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  const visibleEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;
    return events.filter((event) =>
      [event.title, event.location, event.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [events, query]);

  const upcomingCount = events.filter((event) => eventState(event).label === "Upcoming").length;
  const locationCount = new Set(events.map((event) => event.location).filter(Boolean)).size;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Club calendar
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Events</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Plan tournaments, community nights, and every moment your members should know about.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800"
        >
          {showForm ? "Hide event form" : "+ Create event"}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total events", events.length, "All scheduled and past events"],
          ["Upcoming", upcomingCount, "Ready for your community"],
          ["Locations", locationCount, "Unique event venues"],
        ].map(([label, value, hint]) => (
          <div key={String(label)} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-950">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{hint}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-violet-950 via-indigo-900 to-sky-900 px-5 py-5 text-white sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">New event</p>
            <h2 className="mt-1 text-xl font-bold">Create something members will remember</h2>
            <p className="mt-1 text-sm text-indigo-100">Add the basics now — you can build the full event page later.</p>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Event title <span className="text-rose-500">*</span></span>
              <input name="title" required placeholder="e.g. Friday Night Fights" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Starts at</span>
              <input name="startsAt" type="datetime-local" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Ends at</span>
              <input name="endsAt" type="datetime-local" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Location</span>
              <input name="location" placeholder="Online, Discord, or venue" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Description</span>
              <textarea name="description" rows={3} placeholder="Tell members what to expect, who can join, and what to bring..." className="w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
            </label>
            <div className="flex items-center justify-between gap-4 sm:col-span-2">
              <p className="text-xs text-zinc-500">Dates are shown in your visitors&apos; local timezone.</p>
              <button type="submit" disabled={saving} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:opacity-60">
                {saving ? "Creating…" : "Create event"}
              </button>
            </div>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-950">Your calendar</h2>
            <p className="mt-1 text-sm text-zinc-500">Keep members informed with a clear event timeline.</p>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." className="w-56 rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">Loading your calendar…</div>
        ) : visibleEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl text-violet-600">✦</div>
            <h3 className="mt-4 font-semibold text-zinc-900">{query ? "No matching events" : "Your calendar is empty"}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
              {query ? "Try a different search term." : "Create your first event to start building community momentum."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleEvents.map((event) => {
              const state = eventState(event);
              const date = event.startsAt ? new Date(event.startsAt) : null;
              return (
                <article key={event.id} className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-700 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">{date ? date.toLocaleDateString("en", { month: "short" }) : "TBD"}</span>
                      <span className="text-2xl font-black leading-6">{date ? date.getDate() : "—"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-zinc-950">{event.title}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${state.className}`}>{state.label}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-violet-700">{formatDate(event.startsAt)}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatTime(event.startsAt)}{event.endsAt ? ` – ${formatTime(event.endsAt)}` : ""}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                  </div>
                  {event.description ? <p className="mt-4 border-t border-zinc-100 pt-4 text-sm leading-6 text-zinc-600">{event.description}</p> : null}
                  <div className="mt-4 flex justify-end border-t border-zinc-100 pt-3">
                    <button type="button" onClick={() => void onDelete(event.id)} className="text-xs font-semibold text-zinc-400 transition hover:text-rose-600">Delete event</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
