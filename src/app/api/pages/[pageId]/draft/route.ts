import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import {
  getDraftContent,
  publishPage,
  saveDraft,
} from "@/lib/pages/versions";

type Params = { params: Promise<{ pageId: string }> };

const saveDraftSchema = z.object({
  content: z.unknown(),
});

/** Builder: read draft only. */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { pageId } = await params;
    const data = await getDraftContent(pageId);
    return jsonOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Builder: save edits to draft — live site unchanged. */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { pageId } = await params;
    const body = saveDraftSchema.parse(await request.json());
    const result = await saveDraft(pageId, body.content as never);
    return jsonOk({
      ok: true,
      draftId: result.draft.id,
      version: result.draft.version,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
