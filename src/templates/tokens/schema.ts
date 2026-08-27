/** Design tokens for template themes and live sites. */
export type ThemeTokens = {
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
};

export const DEFAULT_THEME: ThemeTokens = {
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
