import {
  looksLikeHtml,
  sanitizeHeadingHtml,
  sanitizeHtml,
} from "@/lib/security/sanitize";

type HtmlTag = "div" | "p" | "span" | "h1" | "h2" | "h3";

const INLINE_TAGS = new Set<HtmlTag>(["h1", "h2", "h3", "p", "span"]);

export function HtmlContent({
  value,
  className,
  as: Tag = "div",
}: {
  value: string;
  className?: string;
  as?: HtmlTag;
}) {
  if (!value) return null;
  if (!looksLikeHtml(value)) {
    return <Tag className={className}>{value}</Tag>;
  }
  const html = INLINE_TAGS.has(Tag)
    ? sanitizeHeadingHtml(value)
    : sanitizeHtml(value);
  if (!html) return null;
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
