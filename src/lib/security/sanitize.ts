import DOMPurify from "isomorphic-dompurify";

/** Sanitize HTML strings (e.g. TipTap output) before dangerouslySetInnerHTML. */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}
