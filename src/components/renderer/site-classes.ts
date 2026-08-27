/** Theme-aware Tailwind class strings for public site sections. */
export const site = {
  heading: "font-semibold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading,var(--font-family))]",
  h1: "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-[var(--color-text)] [font-family:var(--font-heading,var(--font-family))]",
  h2: "text-2xl font-semibold tracking-tight sm:text-3xl text-[var(--color-text)] [font-family:var(--font-heading,var(--font-family))]",
  h3: "text-lg font-semibold text-[var(--color-text)]",
  body: "leading-relaxed text-[var(--color-muted,var(--color-text))]",
  muted: "text-sm text-[var(--color-muted)]",
  caption: "text-sm text-[var(--color-muted)]",
  btn:
    "inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
  btnGhost:
    "inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)]",
  card:
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition hover:border-[var(--color-primary)]/40",
  sectionInner: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
  link: "text-[var(--color-text)] transition hover:text-[var(--color-primary)] hover:underline",
  navCta:
    "inline-flex rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90",
  divider: "border-[var(--color-border)]",
  imageBg: "bg-[var(--color-surface)]",
} as const;
