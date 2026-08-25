import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getDraftContent } from "@/lib/pages/versions";
import type { PageContent } from "@/lib/page-schema";
import { PreviewDeviceToggle } from "@/components/builder/PreviewDeviceToggle";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { RenderDevice } from "@/components/renderer/PageRenderer";

type Props = {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ device?: string }>;
};

function parseDevice(value: string | undefined): RenderDevice {
  if (value === "tablet" || value === "mobile" || value === "desktop") {
    return value;
  }
  return "desktop";
}

export default async function AdminPreviewPage({
  params,
  searchParams,
}: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { pageId } = await params;
  const { device: deviceParam } = await searchParams;

  let data: Awaited<ReturnType<typeof getDraftContent>>;
  try {
    data = await getDraftContent(pageId);
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login");
    if (error instanceof ForbiddenError) redirect("/admin");
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const content = (data.draft.content ?? { sections: [] }) as PageContent;
  if (!Array.isArray(content.sections)) {
    content.sections = [];
  }

  return (
    <PreviewDeviceToggle
      content={content}
      title={data.page.title}
      initialDevice={parseDevice(deviceParam)}
    />
  );
}
