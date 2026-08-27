import { getCatalogTemplate } from "../catalog";
import type { TemplateDefinition, TemplatePageDef } from "../builders";

export type TemplatePreviewData = {
  template: TemplateDefinition;
  page: TemplatePageDef;
  path: string;
};

export function getTemplatePreviewPage(
  templateKey: string,
  path = "/",
): TemplatePreviewData | null {
  const template = getCatalogTemplate(templateKey);
  if (!template) return null;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const page =
    template.pages.find((p) => p.path === normalized) ??
    template.pages.find((p) => p.path === "/");

  if (!page) return null;

  return { template, page, path: page.path };
}

export function listTemplatePreviewPages(templateKey: string) {
  const template = getCatalogTemplate(templateKey);
  if (!template) return null;
  return template.pages.map((p) => ({ title: p.title, path: p.path }));
}
