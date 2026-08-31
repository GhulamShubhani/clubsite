"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Tokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  fontHeading: string;
  fontBody: string;
  fontFamily?: string;
};

const defaults: Tokens = {
  primary: "#6366f1",
  secondary: "#1e1b4b",
  accent: "#22d3ee",
  background: "#0f172a",
  surface: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  border: "rgba(148, 163, 184, 0.2)",
  fontHeading: "Orbitron, system-ui, sans-serif",
  fontBody: "Inter, system-ui, sans-serif",
};

const palettes: Array<{ name: string; colors: Pick<Tokens, "primary" | "secondary" | "accent" | "background" | "surface" | "text" | "muted"> }> = [
  {
    name: "Midnight",
    colors: {
      primary: "#6366f1",
      secondary: "#1e1b4b",
      accent: "#22d3ee",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      muted: "#94a3b8",
    },
  },
  {
    name: "Neon",
    colors: {
      primary: "#ec4899",
      secondary: "#500724",
      accent: "#a78bfa",
      background: "#180a18",
      surface: "#3b0f3b",
      text: "#fdf2f8",
      muted: "#f9a8d4",
    },
  },
  {
    name: "Arena",
    colors: {
      primary: "#f59e0b",
      secondary: "#451a03",
      accent: "#ef4444",
      background: "#0c0a09",
      surface: "#292524",
      text: "#fafaf9",
      muted: "#d6d3d1",
    },
  },
  {
    name: "Emerald",
    colors: {
      primary: "#10b981",
      secondary: "#064e3b",
      accent: "#facc15",
      background: "#061a14",
      surface: "#123c31",
      text: "#ecfdf5",
      muted: "#a7f3d0",
    },
  },
];

type ColorKey = Exclude<keyof Tokens, "fontFamily" | "fontHeading" | "fontBody">;

const colorFields: Array<[ColorKey, string, string]> = [
  ["primary", "Primary", "Buttons, links, and highlights"],
  ["accent", "Accent", "Badges and secondary highlights"],
  ["background", "Background", "Main page background"],
  ["surface", "Surface", "Cards, panels, and navigation"],
  ["secondary", "Secondary", "Footer and deep contrast"],
  ["text", "Text", "Main readable text"],
  ["muted", "Muted text", "Descriptions and supporting text"],
];

function safeColor(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

export default function AdminThemePage() {
  const [tokens, setTokens] = useState<Tokens>(defaults);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activePalette, setActivePalette] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/theme");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load theme");
      return;
    }
    setTokens({ ...defaults, ...(data.tokens as Tokens) });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setTokens({ ...defaults, ...(data.tokens as Tokens) });
      setMessage("Theme saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const previewStyle = useMemo(
    () =>
      ({
        "--preview-primary": tokens.primary,
        "--preview-secondary": tokens.secondary,
        "--preview-accent": tokens.accent,
        "--preview-background": tokens.background,
        "--preview-surface": tokens.surface,
        "--preview-text": tokens.text,
        "--preview-muted": tokens.muted,
        "--preview-border": tokens.border,
        "--preview-heading": tokens.fontHeading,
        "--preview-body": tokens.fontBody,
      }) as React.CSSProperties,
    [tokens],
  );

  function updateToken(key: keyof Tokens, value: string) {
    setActivePalette(null);
    setTokens((current) => ({ ...current, [key]: value }));
  }

  function applyPalette(palette: (typeof palettes)[number]) {
    setActivePalette(palette.name);
    setTokens((current) => ({
      ...current,
      ...palette.colors,
      border: `color-mix(in srgb, ${palette.colors.text} 18%, transparent)`,
    }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Website design system
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Make it yours</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Shape the colors and typography of every page. Your changes are previewed live
            and apply consistently to the navbar, cards, buttons, and sections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm font-medium text-emerald-700">{message}</span>}
          {error && <span className="text-sm font-medium text-red-600">{error}</span>}
          <button
            type="submit"
            form="theme-form"
            disabled={saving}
            className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,1.15fr)]">
        <form id="theme-form" onSubmit={onSave} className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-zinc-950">Start with a palette</h2>
              <p className="mt-1 text-xs text-zinc-500">Choose a base, then fine-tune every color.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {palettes.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => applyPalette(palette)}
                  className={`group rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    activePalette === palette.name
                      ? "border-violet-500 ring-2 ring-violet-100"
                      : "border-zinc-200"
                  }`}
                >
                  <span
                    className="mb-2 flex h-12 overflow-hidden rounded-lg"
                    style={{
                      background: palette.colors.background,
                    }}
                  >
                    <span className="w-1/2" style={{ background: palette.colors.primary }} />
                    <span className="w-1/4" style={{ background: palette.colors.accent }} />
                    <span className="w-1/4" style={{ background: palette.colors.surface }} />
                  </span>
                  <span className="text-xs font-semibold text-zinc-800">{palette.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-zinc-950">Color tokens</h2>
              <p className="mt-1 text-xs text-zinc-500">
                These semantic colors keep the whole website visually consistent.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {colorFields.map(([key, label, hint]) => (
                <label key={key} className="group rounded-xl border border-zinc-200 p-3">
                  <span className="flex items-center gap-3">
                    <input
                      type="color"
                      value={safeColor(tokens[key], "#6366f1")}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="h-11 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-zinc-800">{label}</span>
                      <span className="block truncate text-[11px] text-zinc-500">{hint}</span>
                    </span>
                  </span>
                  <input
                    value={tokens[key]}
                    onChange={(e) => updateToken(key, e.target.value)}
                    className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    aria-label={`${label} hex value`}
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block rounded-xl border border-zinc-200 p-3">
              <span className="text-sm font-semibold text-zinc-800">Border color</span>
              <span className="mt-1 block text-[11px] text-zinc-500">
                Supports hex, rgb, and rgba values for subtle outlines.
              </span>
              <input
                value={tokens.border}
                onChange={(e) => updateToken("border", e.target.value)}
                className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-zinc-950">Typography</h2>
              <p className="mt-1 text-xs text-zinc-500">Use a web-safe stack or add a font name from your deployment.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-zinc-800">Heading font</span>
                <input
                  value={tokens.fontHeading}
                  onChange={(e) => updateToken("fontHeading", e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm text-zinc-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  placeholder="Space Grotesk, sans-serif"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-zinc-800">Body font</span>
                <input
                  value={tokens.fontBody}
                  onChange={(e) => updateToken("fontBody", e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm text-zinc-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  placeholder="Inter, sans-serif"
                />
              </label>
            </div>
          </section>
        </form>

        <section className="min-w-0">
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Live preview</h2>
                <p className="text-xs text-zinc-400">Updates as you edit</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="overflow-x-auto p-3 sm:p-5">
              <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-white/10" style={previewStyle}>
                <div
                  className="flex items-center justify-between gap-4 px-5 py-4"
                  style={{ background: "var(--preview-surface)", color: "var(--preview-text)", borderBottom: "1px solid var(--preview-border)" }}
                >
                  <span className="truncate text-sm font-bold" style={{ fontFamily: "var(--preview-heading)" }}>
                    NOVA<span style={{ color: "var(--preview-primary)" }}>//</span>CLUB
                  </span>
                  <div className="hidden gap-4 text-[10px] sm:flex" style={{ color: "var(--preview-muted)" }}>
                    <span>Teams</span><span>Events</span><span>About</span>
                  </div>
                  <span className="rounded-md px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: "var(--preview-primary)" }}>
                    Join now
                  </span>
                </div>
                <div
                  className="relative overflow-hidden px-6 py-14 sm:px-10"
                  style={{ background: "linear-gradient(135deg, var(--preview-secondary), var(--preview-background))", color: "var(--preview-text)" }}
                >
                  <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full blur-3xl" style={{ background: "var(--preview-primary)", opacity: 0.25 }} />
                  <div className="relative">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--preview-accent)" }}>
                      Season 2026 · Competitive gaming
                    </span>
                    <h3 className="mt-3 max-w-md text-3xl font-black leading-tight sm:text-4xl" style={{ fontFamily: "var(--preview-heading)" }}>
                      Find your squad.<br /><span style={{ color: "var(--preview-primary)" }}>Own the moment.</span>
                    </h3>
                    <p className="mt-3 max-w-sm text-xs leading-5" style={{ color: "var(--preview-muted)", fontFamily: "var(--preview-body)" }}>
                      Tournaments, training, and a community built for players who want to level up.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-lg px-3 py-2 text-[11px] font-bold text-white" style={{ background: "var(--preview-primary)" }}>Explore teams</span>
                      <span className="rounded-lg border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: "var(--preview-border)", color: "var(--preview-text)" }}>View events</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-3" style={{ background: "var(--preview-background)", fontFamily: "var(--preview-body)" }}>
                  {[
                    ["24", "Active teams"],
                    ["186", "Members"],
                    ["12", "Events this month"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-lg border p-3" style={{ background: "var(--preview-surface)", borderColor: "var(--preview-border)" }}>
                      <div className="text-xl font-bold" style={{ color: "var(--preview-text)" }}>{value}</div>
                      <div className="mt-1 text-[10px]" style={{ color: "var(--preview-muted)" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-zinc-500">
              This preview represents how your theme flows through the full website.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
