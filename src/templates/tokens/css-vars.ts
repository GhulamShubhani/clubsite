import type { CSSProperties } from "react";
import { DEFAULT_THEME, type ThemeTokens } from "./schema";

export function normalizeThemeTokens(raw: Record<string, unknown>): ThemeTokens {
  return {
    primary: String(raw.primary ?? DEFAULT_THEME.primary),
    secondary: String(raw.secondary ?? DEFAULT_THEME.secondary),
    accent: String(raw.accent ?? DEFAULT_THEME.accent),
    background: String(raw.background ?? DEFAULT_THEME.background),
    surface: String(raw.surface ?? DEFAULT_THEME.surface),
    text: String(raw.text ?? DEFAULT_THEME.text),
    muted: String(raw.muted ?? DEFAULT_THEME.muted),
    border: String(raw.border ?? DEFAULT_THEME.border),
    fontHeading: String(
      raw.fontHeading ?? raw.fontFamily ?? DEFAULT_THEME.fontHeading,
    ),
    fontBody: String(raw.fontBody ?? raw.fontFamily ?? DEFAULT_THEME.fontBody),
  };
}

/** Map theme tokens → CSS custom properties for PageRenderer. */
export function themeTokensToCssVars(
  tokens?: Record<string, unknown> | null,
): CSSProperties {
  const t = normalizeThemeTokens((tokens ?? {}) as Record<string, unknown>);
  return {
    ["--color-primary" as string]: t.primary,
    ["--color-secondary" as string]: t.secondary,
    ["--color-accent" as string]: t.accent,
    ["--color-bg" as string]: t.background,
    ["--color-surface" as string]: t.surface,
    ["--color-text" as string]: t.text,
    ["--color-muted" as string]: t.muted,
    ["--color-border" as string]: t.border,
    ["--font-heading" as string]: t.fontHeading,
    ["--font-family" as string]: t.fontBody,
    backgroundColor: t.background,
    color: t.text,
    fontFamily: t.fontBody,
  };
}

/** Inline styles for navbar / footer / hero shells built from tokens. */
export function shellStyles(
  theme: ThemeTokens,
  variant: "navbar" | "footer" | "hero" | "section" | "cta",
): Record<string, string> {
  switch (variant) {
    case "navbar":
      return {
        background: theme.surface,
        color: theme.text,
        borderBottom: `1px solid ${theme.border}`,
        padding: "0",
      };
    case "footer":
      return {
        background: theme.secondary,
        color: theme.muted,
        borderTop: `1px solid ${theme.border}`,
        padding: "2.5rem 0",
      };
    case "hero":
      return { padding: "0" };
    case "cta":
      return {
        background: `linear-gradient(135deg, ${theme.primary}22, ${theme.accent}18)`,
        border: `1px solid ${theme.border}`,
        borderRadius: "1rem",
        padding: "2.5rem",
        color: theme.text,
      };
    default:
      return { padding: "3rem 0" };
  }
}
