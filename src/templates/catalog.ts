import { cyberCafeTemplate } from "./sites/cyber-cafe";
import { esportsTeamTemplate } from "./sites/esports-team";
import { gamingCafeTemplate } from "./sites/gaming-cafe";
import { gamingClubTemplate } from "./sites/gaming-club";
import { gamingCommunityTemplate } from "./sites/gaming-community";
import { lanCenterTemplate } from "./sites/lan-center";
import { streamerTemplate } from "./sites/streamer";
import { tournamentTemplate } from "./sites/tournament";

export type {
  TemplateDefinition,
  TemplateNavItem,
  TemplatePageDef,
} from "./builders";

export type TemplateConfig = ReturnType<typeof toTemplateConfig>;

export { toTemplateConfig } from "./builders";

import type { TemplateDefinition } from "./builders";
import { toTemplateConfig } from "./builders";

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  gamingClubTemplate(),
  esportsTeamTemplate(),
  gamingCommunityTemplate(),
  gamingCafeTemplate(),
  lanCenterTemplate(),
  tournamentTemplate(),
  streamerTemplate(),
  cyberCafeTemplate(),
];

export const TEMPLATE_KEYS = TEMPLATE_CATALOG.map((t) => t.key) as readonly string[];

export function getCatalogTemplate(key: string): TemplateDefinition | undefined {
  return TEMPLATE_CATALOG.find((t) => t.key === key);
}

export function getTemplateSummary(key: string) {
  const t = getCatalogTemplate(key);
  if (!t) return null;
  return {
    key: t.key,
    pageCount: t.pages.length,
    pages: t.pages.map((p) => ({ title: p.title, path: p.path })),
  };
}

export function getAllTemplateSummaries() {
  return TEMPLATE_CATALOG.map((t) => ({
    key: t.key,
    pageCount: t.pages.length,
    pages: t.pages.map((p) => ({ title: p.title, path: p.path })),
  }));
}
