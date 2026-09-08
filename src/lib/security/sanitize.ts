import sanitizeHtmlLib from "sanitize-html";

/** Sanitize HTML strings (e.g. TipTap output) before dangerouslySetInnerHTML. */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtmlLib(dirty, {
    allowedTags: [
      ...sanitizeHtmlLib.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
    ],
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      "*": ["class", "style"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Inline-only HTML for headings so TipTap `<p>` / `<h2>` wrappers are not shown as tags. */
export function sanitizeHeadingHtml(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtmlLib(dirty, {
    allowedTags: ["strong", "b", "em", "i", "u", "s", "br", "span", "a", "code"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  }).trim();
}

/** Plain text from HTML, for alt attributes and iframe titles. */
export function stripHtml(value: string): string {
  if (!value) return "";
  return sanitizeHtmlLib(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
