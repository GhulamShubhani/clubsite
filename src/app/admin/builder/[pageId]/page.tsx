import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getDraftContent } from "@/lib/pages/versions";
import type { PageContent } from "@/lib/page-schema";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { PublicSiteProvider } from "@/components/public/PublicSiteContext";

type Props = { params: Promise<{ pageId: string }> };

export default async function AdminBuilderPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { pageId } = await params;

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
    <PublicSiteProvider basePath="" tenantSlug={data.tenantSlug}>
      <BuilderShell
        pageId={data.page.id}
        initialTitle={data.page.title}
        initialContent={content}
      />
    </PublicSiteProvider>
  );
}
