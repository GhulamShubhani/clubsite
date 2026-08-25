import type { CSSProperties } from "react";
import type { PageContent, PageSection } from "@/lib/page-schema";
import { themeTokensToCssVars } from "@/lib/tenant/public-site";
import { SectionRenderer } from "./SectionRenderer";

export type RenderDevice = "desktop" | "tablet" | "mobile";

type Props = {
  content: PageContent;
  device?: RenderDevice;
  className?: string;
  themeTokens?: Record<string, unknown>;
};

function mergeSectionForDevice(
  section: PageSection,
  device?: RenderDevice,
): PageSection {
  if (!device || !section.responsive) return section;
  const override = section.responsive[device];
  if (!override || Object.keys(override).length === 0) return section;
  return {
    ...section,
    styles: {
      ...(section.styles ?? {}),
      ...override,
    },
  };
}

export function resolveSectionForDevice(
  section: PageSection,
  device?: RenderDevice,
): PageSection {
  return mergeSectionForDevice(section, device);
}

export function PageRenderer({
  content,
  device = "desktop",
  className,
  themeTokens,
}: Props) {
  const sections = content.sections ?? [];
  const themeStyle: CSSProperties | undefined = themeTokens
    ? themeTokensToCssVars(themeTokens)
    : undefined;

  return (
    <div className={className ?? "w-full"} style={themeStyle}>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={mergeSectionForDevice(section, device)}
        />
      ))}
    </div>
  );
}
