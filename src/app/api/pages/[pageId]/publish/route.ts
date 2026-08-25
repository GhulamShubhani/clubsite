import { handleApiError, jsonOk } from "@/lib/api";
import { publishPage } from "@/lib/pages/versions";

type Params = { params: Promise<{ pageId: string }> };

/** Promote draft → published. Public site updates only after this succeeds. */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { pageId } = await params;
    const result = await publishPage(pageId);
    return jsonOk({
      ok: true,
      publishedVersion: result.published.version,
      publishedAt: result.published.publishedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
