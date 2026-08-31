type Props = {
  name: string;
  description?: string | null;
  url: string;
  pageTitle?: string | null;
  pagePath?: string;
  logoUrl?: string | null;
};

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Search-engine structured data for a club website and its current page. */
export function StructuredData({
  name,
  description,
  url,
  pageTitle,
  pagePath = "/",
  logoUrl,
}: Props) {
  const baseUrl = url.replace(/\/$/, "");
  const pageUrl = `${baseUrl}${pagePath === "/" ? "" : pagePath}`;
  const graph = [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name,
      url: baseUrl,
      ...(description ? { description } : {}),
      ...(logoUrl ? { logo: { "@type": "ImageObject", url: logoUrl } } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name,
      url: baseUrl,
      publisher: { "@id": `${baseUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}/#webpage`,
      url: pageUrl,
      name: pageTitle || name,
      isPartOf: { "@id": `${baseUrl}/#website` },
      about: { "@id": `${baseUrl}/#organization` },
      ...(description ? { description } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        ...(pagePath !== "/"
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: pageTitle || pagePath.slice(1),
                item: pageUrl,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
