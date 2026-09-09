import { createSection } from "@/lib/components/registry";
import { COMPONENT_REGISTRY } from "@/lib/components/registry";
import { cloneSectionWithNewIds } from "@/lib/components/clone-section";
import type { PageSection } from "@/lib/page-schema";
import type { TemplateDefinition, TemplatePageDef } from "./builders";
import { STOCK } from "./stock-images";

const MIN_LIST = 6;
const SKIP_PAD_KEYS = new Set(["links", "buttons", "slides"]);
const SKIP_EXTRA_TYPES = new Set([
  "navbar",
  "footer",
  "header",
  "spacer",
  "heading",
  "text",
]);
const STOCK_CYCLE = [
  STOCK.crowd,
  STOCK.setup,
  STOCK.trophy,
  STOCK.teamPhoto,
  STOCK.stream,
  STOCK.keyboard,
  STOCK.venue,
  STOCK.gamingHero,
];

function isSectionLike(value: unknown): value is PageSection {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      "id" in value &&
      "props" in value,
  );
}

function suffixCopy(item: Record<string, unknown>, n: number) {
  const copy = structuredClone(item);
  const tag = ` ${n + 1}`;
  for (const key of ["name", "title", "heading", "label", "caption", "gamertag"]) {
    if (typeof copy[key] === "string" && copy[key]) {
      copy[key] = `${String(copy[key])}${tag}`;
    }
  }
  if (typeof copy.rank === "number") copy.rank = copy.rank + n;
  if (typeof copy.imageUrl === "string") {
    copy.imageUrl = STOCK_CYCLE[n % STOCK_CYCLE.length];
  }
  return copy;
}

function padList(value: unknown): unknown {
  if (!Array.isArray(value) || value.length === 0 || value.length >= MIN_LIST) {
    return value;
  }
  const out = [...value];
  let i = 0;
  while (out.length < MIN_LIST) {
    const src = value[i % value.length];
    if (isSectionLike(src)) {
      const clone = cloneSectionWithNewIds(src);
      const titleKeys = ["title", "heading", "name", "text"];
      for (const key of titleKeys) {
        if (typeof clone.props[key] === "string" && clone.props[key]) {
          clone.props[key] = `${String(clone.props[key])} ${out.length + 1}`;
        }
      }
      out.push(clone);
    } else if (src && typeof src === "object" && !Array.isArray(src)) {
      out.push(suffixCopy(src as Record<string, unknown>, out.length));
    } else {
      out.push(structuredClone(src));
    }
    i += 1;
  }
  return out;
}

function enrichSection(section: PageSection): PageSection {
  if (section.type === "match-calendar") return section;
  const props: Record<string, unknown> = { ...(section.props ?? {}) };
  for (const [key, val] of Object.entries(props)) {
    if (SKIP_PAD_KEYS.has(key)) continue;
    if (Array.isArray(val)) {
      props[key] = padList(val);
    }
  }
  return { ...section, props };
}

function collectTypes(sections: PageSection[]): Set<string> {
  const types = new Set<string>();
  const walk = (list: PageSection[]) => {
    for (const sec of list) {
      types.add(sec.type);
      const children = sec.props?.children;
      if (Array.isArray(children)) {
        walk(children.filter(isSectionLike));
      }
    }
  };
  walk(sections);
  return types;
}

function fillMedia(section: PageSection): PageSection {
  const props = { ...section.props };
  if ("imageUrl" in props && !props.imageUrl) {
    props.imageUrl = STOCK.crowd;
  }
  if (Array.isArray(props.items)) {
    props.items = (props.items as Array<Record<string, unknown>>).map(
      (item, i) => {
        if (!item || typeof item !== "object") return item;
        if ("imageUrl" in item && !item.imageUrl) {
          return { ...item, imageUrl: STOCK_CYCLE[i % STOCK_CYCLE.length] };
        }
        return item;
      },
    );
  }
  return { ...section, props };
}

function extraBlocks(existing: PageSection[]): PageSection[] {
  const used = collectTypes(existing);
  const extras: PageSection[] = [];
  for (const type of Object.keys(COMPONENT_REGISTRY)) {
    if (SKIP_EXTRA_TYPES.has(type) || used.has(type)) continue;
    extras.push(fillMedia(createSection(type)));
    used.add(type);
  }
  if (extras.length === 0) return [];
  return [
    createSection("heading"),
    createSection("text"),
    ...extras,
  ].map((sec, i) => {
    if (sec.type === "heading") {
      return {
        ...sec,
        props: {
          ...sec.props,
          text: "More blocks — delete anything you don’t need",
          heading: "More blocks — delete anything you don’t need",
          level: 2,
        },
      };
    }
    if (sec.type === "text" && i === 1) {
      return {
        ...sec,
        props: {
          ...sec.props,
          text: "Every extra component is included as sample content. Remove or duplicate blocks in the builder.",
          description:
            "Every extra component is included as sample content. Remove or duplicate blocks in the builder.",
        },
      };
    }
    return sec;
  });
}

function enrichPage(page: TemplatePageDef): TemplatePageDef {
  const sections = (page.content.sections ?? []).map(enrichSection);
  const extras = extraBlocks(sections);
  if (extras.length === 0) {
    return { ...page, content: { sections } };
  }
  const footerIndex = [...sections]
    .map((sec, i) => (sec.type === "footer" ? i : -1))
    .filter((i) => i >= 0)
    .pop();
  const next =
    footerIndex !== undefined && footerIndex >= 0
      ? [...sections.slice(0, footerIndex), ...extras, ...sections.slice(footerIndex)]
      : [...sections, ...extras];
  return { ...page, content: { sections: next } };
}

export function enrichTemplate(def: TemplateDefinition): TemplateDefinition {
  return {
    ...def,
    pages: def.pages.map(enrichPage),
  };
}
