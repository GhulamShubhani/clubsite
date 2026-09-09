import { v4 as uuidv4 } from "uuid";
import type { PageSection } from "@/lib/page-schema";

function isSectionLike(value: unknown): value is PageSection {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      "id" in value &&
      "props" in value,
  );
}

function remapIds(section: PageSection): PageSection {
  const next: PageSection = {
    ...section,
    id: uuidv4(),
    props: structuredClone(section.props ?? {}),
    styles: section.styles ? structuredClone(section.styles) : undefined,
    responsive: section.responsive
      ? structuredClone(section.responsive)
      : undefined,
  };

  const children = next.props.children;
  if (Array.isArray(children)) {
    next.props.children = children.map((child) =>
      isSectionLike(child) ? remapIds(child) : structuredClone(child),
    );
  }

  return next;
}

/** Deep-clone a section (and nested grid children) with fresh IDs. */
export function cloneSectionWithNewIds(section: PageSection): PageSection {
  return remapIds(structuredClone(section));
}
