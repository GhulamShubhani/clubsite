import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import type { PageContent } from "@/lib/page-schema";
import { TemplatePreviewShell } from "@/components/admin/TemplatePreviewShell";
import type { RenderDevice } from "@/components/renderer/PageRenderer";
import {
  getTemplatePreviewPage,
  listTemplatePreviewPages,
} from "@/templates/preview/resolve-page";

type Props = {
  params: Promise<{ templateKey: string }>;
  searchParams: Promise<{ path?: string; device?: string }>;
};

function parseDevice(value: string | undefined): RenderDevice {
  if (value === "tablet" || value === "mobile" || value === "desktop") {
    return value;
  }
  return "desktop";
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { templateKey } = await params;
  const { path: pathParam, device: deviceParam } = await searchParams;

  const preview = getTemplatePreviewPage(templateKey, pathParam ?? "/");
  if (!preview) {
    notFound();
  }

  const pages = listTemplatePreviewPages(templateKey);
  if (!pages) {
    notFound();
  }

  const content = (preview.page.content ?? { sections: [] }) as PageContent;
  if (!Array.isArray(content.sections)) {
    content.sections = [];
  }

  return (
    <TemplatePreviewShell
      templateKey={templateKey}
      templateName={preview.template.name}
      pages={pages}
      currentPath={preview.path}
      content={content}
      themeTokens={preview.template.theme}
      initialDevice={parseDevice(deviceParam)}
    />
  );
}
