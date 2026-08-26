import type { CSSProperties, ReactNode } from "react";
import type { PageSection } from "@/lib/page-schema";
import { looksLikeHtml, sanitizeHtml } from "@/lib/security/sanitize";
import { ContactForm } from "./ContactForm";
import { EventCountdown } from "./EventCountdown";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";
import { NavbarSection } from "./NavbarSection";
import type { RenderDevice } from "./PageRenderer";

type Props = {
  section: PageSection;
  className?: string;
  /** Builder / preview device — used instead of CSS breakpoints for canvas width. */
  device?: RenderDevice;
};

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function styleFrom(styles?: Record<string, unknown>): CSSProperties | undefined {
  if (!styles || Object.keys(styles).length === 0) return undefined;
  return styles as CSSProperties;
}

function Shell({
  section,
  className,
  children,
}: {
  section: PageSection;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-section-id={section.id}
      data-section-type={section.type}
      className={className}
      style={styleFrom(section.styles)}
    >
      {children}
    </section>
  );
}

function HeadingBlock({
  heading,
  description,
  as: Tag = "h2",
}: {
  heading?: string;
  description?: string;
  as?: "h1" | "h2" | "h3";
}) {
  if (!heading && !description) return null;
  return (
    <div className="mb-4">
      {heading ? (
        <Tag className="text-2xl font-semibold tracking-tight text-zinc-900">
          {heading}
        </Tag>
      ) : null}
      {description ? (
        <RichText
          value={description}
          className="mt-2 text-zinc-600"
          as="div"
        />
      ) : null}
    </div>
  );
}

function Buttons({
  buttons,
  single,
}: {
  buttons?: unknown;
  single?: { label?: string; href?: string };
}) {
  const list = asArray<{ label?: string; href?: string }>(buttons);
  const items =
    list.length > 0
      ? list
      : single?.label
        ? [{ label: single.label, href: single.href ?? "#" }]
        : [];
  if (items.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {items.map((btn, i) => (
        <a
          key={`${btn.label}-${i}`}
          href={asString(btn.href, "#")}
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {asString(btn.label, "Button")}
        </a>
      ))}
    </div>
  );
}

function LinkList({
  links,
}: {
  links: Array<{ label?: string; href?: string }>;
}) {
  if (links.length === 0) return null;
  return (
    <nav className="flex flex-wrap gap-4 text-sm">
      {links.map((link, i) => (
        <a
          key={`${link.label}-${i}`}
          href={asString(link.href, "#")}
          className="hover:underline"
        >
          {asString(link.label, "Link")}
        </a>
      ))}
    </nav>
  );
}

function ItemGrid({
  items,
  columns = 3,
  render,
}: {
  items: unknown[];
  columns?: number;
  render: (item: Record<string, unknown>, index: number) => ReactNode;
}) {
  const cols = Math.min(Math.max(columns, 1), 4);
  const colClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
        ? "sm:grid-cols-2"
        : cols === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid gap-4 ${colClass}`}>
      {items.map((raw, i) => {
        const item =
          typeof raw === "object" && raw !== null
            ? (raw as Record<string, unknown>)
            : { title: String(raw) };
        return <div key={i}>{render(item, i)}</div>;
      })}
    </div>
  );
}

function ImagePlaceholder({
  src,
  alt,
  className = "aspect-video w-full rounded-md bg-zinc-200 object-cover",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} className={className} />;
  }
  return (
    <div
      className={`${className} flex items-center justify-center text-sm text-zinc-400`}
      aria-hidden
    >
      No image
    </div>
  );
}

function RichText({
  value,
  className,
  as: Tag = "div",
}: {
  value: string;
  className?: string;
  as?: "div" | "p" | "span";
}) {
  if (!value) return null;
  if (looksLikeHtml(value)) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
      />
    );
  }
  return <Tag className={className}>{value}</Tag>;
}

function HeroCopy({
  heading,
  description,
  buttons,
  single,
  align = "center",
  headingClassName,
}: {
  heading: string;
  description: string;
  buttons?: unknown;
  single?: { label?: string; href?: string };
  align?: "left" | "center";
  headingClassName?: string;
}) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <div className={alignClass}>
      <h1
        className={
          headingClassName ??
          "text-4xl font-semibold tracking-tight sm:text-5xl"
        }
      >
        {heading || "Hero"}
      </h1>
      {description ? (
        <RichText
          value={description}
          className="mt-4 text-lg opacity-80"
          as="div"
        />
      ) : null}
      <Buttons buttons={buttons} single={single} />
    </div>
  );
}

export function SectionRenderer({
  section,
  className,
  device = "desktop",
}: Props) {
  const p = section.props ?? {};
  const compact = device === "mobile" || device === "tablet";
  const heading = asString(
    p.heading ?? p.title ?? p.name ?? p.text,
  );
  const description = asString(p.description ?? p.body ?? p.subheading);
  const imageUrl = asString(p.imageUrl);

  switch (section.type) {
    case "navbar": {
      const links = asArray<{ label?: string; href?: string }>(p.links);
      return (
        <NavbarSection
          sectionId={section.id}
          brand={asString(p.brand, "Brand")}
          logoUrl={asString(p.logoUrl) || undefined}
          links={links}
          ctaLabel={asString(p.ctaLabel) || undefined}
          ctaHref={asString(p.ctaHref, "#")}
          sticky={p.sticky === true || p.sticky === "true"}
          height={asString(p.height) || undefined}
          mobileMenu={p.mobileMenu !== false && p.mobileMenu !== "false"}
          device={device}
          style={styleFrom(section.styles)}
          className={className}
        />
      );
    }

    case "header":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading} description={description} as="h1" />
        </Shell>
      );

    case "hero": {
      const layout = asString(p.layout, "centered");
      const videoUrl = asString(p.videoUrl);
      const cta = {
        label: asString(p.ctaLabel),
        href: asString(p.ctaHref, "#"),
      };
      const copyProps = {
        heading,
        description,
        buttons: p.buttons,
        single: cta,
      };

      if (layout === "carousel") {
        const slides = asArray<HeroSlide>(p.slides);
        const seeded =
          slides.length > 0
            ? slides
            : [
                {
                  imageUrl,
                  heading,
                  description,
                  ctaLabel: cta.label,
                  ctaHref: cta.href,
                },
              ];
        return (
          <Shell
            section={section}
            className={`overflow-hidden p-0 ${className ?? ""}`}
          >
            <HeroCarousel
              slides={seeded}
              intervalMs={asNumber(p.carouselIntervalMs, 5000)}
            />
          </Shell>
        );
      }

      if (layout === "full-width-bg" || layout === "background-image") {
        return (
          <Shell
            section={section}
            className={`relative overflow-hidden ${className ?? ""}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={
                imageUrl
                  ? { backgroundImage: `url(${imageUrl})` }
                  : { background: "#18181b" }
              }
            />
            <div className="absolute inset-0 bg-black/55" aria-hidden />
            <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-white">
              <HeroCopy {...copyProps} />
            </div>
          </Shell>
        );
      }

      if (layout === "video-bg") {
        return (
          <Shell
            section={section}
            className={`relative overflow-hidden ${className ?? ""}`}
          >
            {videoUrl ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-black/55" aria-hidden />
            <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-white">
              <HeroCopy {...copyProps} />
            </div>
          </Shell>
        );
      }

      if (layout === "gaming-banner") {
        return (
          <Shell
            section={section}
            className={`border-y-4 border-(--color-primary,#22c55e) ${className ?? ""}`}
          >
            <div className="mx-auto max-w-5xl px-6 py-16">
              <HeroCopy
                {...copyProps}
                headingClassName="text-5xl font-black uppercase tracking-tight sm:text-6xl"
              />
            </div>
          </Shell>
        );
      }

      if (
        layout === "text-left-image-right" ||
        layout === "image-left-text-right" ||
        layout === "split-screen"
      ) {
        const imageFirst =
          layout === "image-left-text-right" || layout === "split-screen";
        const isSplit = layout === "split-screen";
        const textCol = (
          <div
            className={
              isSplit
                ? "flex flex-col justify-center px-8 py-16 lg:px-12"
                : "flex flex-col justify-center"
            }
          >
            <HeroCopy {...copyProps} align="left" />
          </div>
        );
        const imageCol = (
          <div className={isSplit ? "min-h-80" : undefined}>
            <ImagePlaceholder
              src={imageUrl}
              alt={heading}
              className={
                isSplit
                  ? "h-full min-h-80 w-full object-cover"
                  : "aspect-video w-full rounded-md bg-zinc-200 object-cover"
              }
            />
          </div>
        );
        return (
          <Shell section={section} className={className}>
            <div
              className={
                isSplit
                  ? compact
                    ? "grid min-h-96 grid-cols-1"
                    : "grid min-h-96 grid-cols-1 lg:grid-cols-2"
                  : compact
                    ? "mx-auto grid max-w-6xl grid-cols-1 items-center gap-8"
                    : "mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2"
              }
            >
              {imageFirst ? (
                <>
                  {imageCol}
                  {textCol}
                </>
              ) : (
                <>
                  {textCol}
                  {imageCol}
                </>
              )}
            </div>
          </Shell>
        );
      }

      return (
        <Shell section={section} className={className}>
          <div className="mx-auto max-w-3xl">
            <HeroCopy {...copyProps} />
          </div>
          {imageUrl ? (
            <div className="mx-auto mt-8 max-w-4xl">
              <ImagePlaceholder src={imageUrl} alt={heading} />
            </div>
          ) : null}
        </Shell>
      );
    }

    case "heading": {
      const level = asNumber(p.level, 2);
      const text = asString(p.text ?? p.heading, "Heading");
      const Tag = (level <= 1 ? "h1" : level === 2 ? "h2" : "h3") as
        | "h1"
        | "h2"
        | "h3";
      return (
        <Shell section={section} className={className}>
          <Tag className="font-semibold tracking-tight text-zinc-900 text-2xl sm:text-3xl">
            {text}
          </Tag>
        </Shell>
      );
    }

    case "text":
      return (
        <Shell section={section} className={className}>
          <RichText
            value={asString(p.text ?? p.description, "")}
            className="leading-relaxed text-zinc-700"
            as="div"
          />
        </Shell>
      );

    case "image":
      return (
        <Shell section={section} className={className}>
          <figure>
            <ImagePlaceholder
              src={imageUrl}
              alt={asString(p.alt, heading)}
            />
            {asString(p.caption) ? (
              <figcaption className="mt-2 text-center text-sm text-zinc-500">
                {asString(p.caption)}
              </figcaption>
            ) : null}
          </figure>
        </Shell>
      );

    case "video": {
      const videoUrl = asString(p.videoUrl ?? p.embedUrl);
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading} description={description} />
          {videoUrl ? (
            <div className="aspect-video overflow-hidden rounded-md bg-zinc-900">
              <iframe
                title={heading || "Video"}
                src={videoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md bg-zinc-200 text-sm text-zinc-500">
              Add a video URL
            </div>
          )}
        </Shell>
      );
    }

    case "button":
      return (
        <Shell section={section} className={className}>
          <Buttons
            single={{
              label: asString(p.label, "Button"),
              href: asString(p.href, "#"),
            }}
          />
        </Shell>
      );

    case "card":
      return (
        <Shell section={section} className={className}>
          {imageUrl ? (
            <ImagePlaceholder src={imageUrl} alt={heading} className="mb-3 aspect-video w-full rounded-md bg-zinc-200 object-cover" />
          ) : null}
          <h3 className="text-lg font-semibold text-zinc-900">
            {heading || "Card"}
          </h3>
          {description ? (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          ) : null}
          <Buttons buttons={p.buttons} />
        </Shell>
      );

    case "grid": {
      const children = asArray(p.children);
      const items = children.length > 0 ? children : asArray(p.items);
      const columns = asNumber(p.columns, 3);
      return (
        <Shell section={section} className={className}>
          {heading ? <HeadingBlock heading={heading} description={description} /> : null}
          <ItemGrid
            items={items}
            columns={columns}
            render={(item) => {
              if (item.type && typeof item.type === "string") {
                return (
                  <SectionRenderer
                    section={{
                      id: asString(item.id, `${section.id}-child`),
                      type: asString(item.type),
                      props: (item.props as Record<string, unknown>) ?? item,
                      styles: item.styles as Record<string, unknown> | undefined,
                    }}
                  />
                );
              }
              return (
                <div className="rounded-md border border-zinc-200 bg-white p-4">
                  <h3 className="font-semibold text-zinc-900">
                    {asString(item.title ?? item.heading ?? item.name, "Item")}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {asString(item.body ?? item.description)}
                  </p>
                </div>
              );
            }}
          />
        </Shell>
      );
    }

    case "gallery":
    case "gaming-gallery":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Gallery"} description={description} />
          <ItemGrid
            items={asArray(p.items)}
            columns={3}
            render={(item) => (
              <figure>
                <ImagePlaceholder
                  src={asString(item.imageUrl)}
                  alt={asString(item.caption ?? item.alt)}
                />
                {asString(item.caption) ? (
                  <figcaption className="mt-2 text-sm text-zinc-500">
                    {asString(item.caption)}
                  </figcaption>
                ) : null}
              </figure>
            )}
          />
        </Shell>
      );

    case "divider":
      return (
        <Shell section={section} className={className}>
          <hr className="border-zinc-200" />
        </Shell>
      );

    case "spacer":
      return (
        <Shell
          section={section}
          className={className}
        >
          <div
            style={{
              height: asString(p.height, (section.styles?.height as string) ?? "2rem"),
            }}
            aria-hidden
          />
        </Shell>
      );

    case "footer": {
      const links = asArray<{ label?: string; href?: string }>(p.links);
      return (
        <Shell
          section={section}
          className={`space-y-4 ${className ?? ""}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-semibold">{asString(p.brand, "Brand")}</span>
            <LinkList links={links} />
          </div>
          {asString(p.note) ? (
            <p className="text-sm opacity-70">{asString(p.note)}</p>
          ) : null}
        </Shell>
      );
    }

    case "social-links":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Follow us"} description={description} />
          <LinkList
            links={asArray<{ label?: string; href?: string }>(p.items ?? p.links)}
          />
        </Shell>
      );

    case "contact-form":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Contact"} description={description} />
          <ContactForm submitLabel={asString(p.submitLabel, "Send message")} />
        </Shell>
      );

    case "tournament-card":
      return (
        <Shell section={section} className={className}>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {asString(p.status, "Tournament")} · {asString(p.game)}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-zinc-900">
            {heading || asString(p.name, "Tournament")}
          </h3>
          {asString(p.prizePool) ? (
            <p className="mt-2 text-sm text-zinc-600">
              Prize pool: {asString(p.prizePool)}
            </p>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          ) : null}
        </Shell>
      );

    case "match-card":
      return (
        <Shell section={section} className={className}>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {asString(p.game)} · {asString(p.status, "Match")}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-900">
            {heading || asString(p.title, "Match")}
          </h3>
          {asString(p.startsAt) ? (
            <p className="mt-1 text-sm text-zinc-600">{asString(p.startsAt)}</p>
          ) : null}
        </Shell>
      );

    case "team-card":
      return (
        <Shell section={section} className={className}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                {heading || asString(p.name, "Team")}
              </h3>
              <p className="text-sm text-zinc-600">{asString(p.game)}</p>
            </div>
            {asString(p.tag) ? (
              <span className="rounded bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                {asString(p.tag)}
              </span>
            ) : null}
          </div>
          {asString(p.record) ? (
            <p className="mt-2 text-sm text-zinc-500">Record: {asString(p.record)}</p>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          ) : null}
        </Shell>
      );

    case "player-card":
      return (
        <Shell section={section} className={className}>
          {imageUrl ? (
            <ImagePlaceholder
              src={imageUrl}
              alt={heading}
              className="mb-3 aspect-square w-24 rounded-full bg-zinc-200 object-cover"
            />
          ) : null}
          <h3 className="text-lg font-semibold text-zinc-900">
            {heading || asString(p.name, "Player")}
          </h3>
          <p className="text-sm text-zinc-600">
            {asString(p.role)}
            {asString(p.gamertag) ? ` · ${asString(p.gamertag)}` : ""}
          </p>
          {description ? (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          ) : null}
        </Shell>
      );

    case "team-roster":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock
            heading={heading || asString(p.teamName, "Roster")}
            description={description}
          />
          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200">
            {asArray(p.items).map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-zinc-900">
                    {asString(row.name)}
                  </span>
                  <span className="text-zinc-500">
                    {asString(row.role)}
                    {asString(row.gamertag) ? ` · ${asString(row.gamertag)}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </Shell>
      );

    case "leaderboard":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Leaderboard"} description={description} />
          <ol className="divide-y divide-zinc-200 rounded-md border border-zinc-200">
            {asArray(p.items).map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <li key={i} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <span className="w-8 font-mono text-zinc-400">
                    #{asString(row.rank, String(i + 1))}
                  </span>
                  <span className="flex-1 font-medium text-zinc-900">
                    {asString(row.name)}
                  </span>
                  <span className="font-mono text-zinc-600">
                    {asString(row.score)}
                  </span>
                </li>
              );
            })}
          </ol>
        </Shell>
      );

    case "match-schedule":
    case "upcoming-matches": {
      const matches =
        asArray(p.matches).length > 0 ? asArray(p.matches) : asArray(p.items);
      return (
        <Shell section={section} className={className}>
          <HeadingBlock
            heading={heading || asString(p.title, "Schedule")}
            description={description}
          />
          <ul className="space-y-3">
            {matches.map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {asString(row.title ?? row.heading, "Match")}
                    </p>
                    <p className="text-sm text-zinc-500">{asString(row.game)}</p>
                  </div>
                  <span className="text-sm text-zinc-600">
                    {asString(row.startsAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Shell>
      );
    }

    case "tournament-bracket":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Bracket"} description={description} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {asArray(p.items).map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <div
                  key={i}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm"
                >
                  <p className="text-xs uppercase text-zinc-400">
                    {asString(row.label, `Round ${i + 1}`)}
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {asString(row.teams ?? row.title, "TBD")}
                  </p>
                </div>
              );
            })}
          </div>
        </Shell>
      );

    case "match-results":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Results"} description={description} />
          <ul className="space-y-2">
            {asArray(p.items).map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-zinc-900">
                    {asString(row.title)}
                  </span>
                  <span className="font-mono text-zinc-600">
                    {asString(row.score)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Shell>
      );

    case "player-statistics":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Stats"} description={description} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {asArray(p.items).map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <div
                  key={i}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-center"
                >
                  <p className="text-2xl font-semibold text-zinc-900">
                    {asString(row.value)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                    {asString(row.label)}
                  </p>
                </div>
              );
            })}
          </div>
        </Shell>
      );

    case "game-information":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock
            heading={heading || asString(p.game, "Game")}
            description={description}
          />
          {asString(p.platform) ? (
            <p className="text-sm text-zinc-500">
              Platform: {asString(p.platform)}
            </p>
          ) : null}
        </Shell>
      );

    case "prize-pool":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Prize pool"} description={description} />
          {asString(p.amount) ? (
            <p className="text-3xl font-semibold text-zinc-900">
              {asString(p.amount)}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {asArray(p.items).map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <li
                  key={i}
                  className="flex justify-between text-sm text-zinc-700"
                >
                  <span>{asString(row.place)}</span>
                  <span className="font-medium">{asString(row.amount)}</span>
                </li>
              );
            })}
          </ul>
        </Shell>
      );

    case "event-countdown":
      return (
        <Shell section={section} className={`text-center ${className ?? ""}`}>
          <HeadingBlock
            heading={heading || asString(p.eventName, "Event")}
            description={description}
          />
          <EventCountdown targetDate={asString(p.targetDate)} />
        </Shell>
      );

    case "sponsor-section": {
      const sponsors =
        asArray(p.sponsors).length > 0 ? asArray(p.sponsors) : asArray(p.items);
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Sponsors"} description={description} />
          <div className="flex flex-wrap gap-4">
            {sponsors.map((item, i) => {
              const row = item as Record<string, unknown>;
              return (
                <div
                  key={i}
                  className="min-w-32 rounded-md border border-zinc-200 bg-white px-4 py-6 text-center"
                >
                  <p className="font-semibold text-zinc-900">
                    {asString(row.name)}
                  </p>
                  {asString(row.tier) ? (
                    <p className="mt-1 text-xs uppercase text-zinc-400">
                      {asString(row.tier)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Shell>
      );
    }

    case "discord-section":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Discord"} description={description} />
          {asString(p.memberCount) ? (
            <p className="mb-3 text-sm opacity-80">
              {asString(p.memberCount)} members
            </p>
          ) : null}
          <Buttons
            single={{
              label: "Join Discord",
              href: asString(p.inviteUrl, "#"),
            }}
          />
        </Shell>
      );

    case "twitch-stream":
    case "youtube-stream": {
      const platform = asString(p.platform, section.type === "twitch-stream" ? "twitch" : "youtube").toLowerCase();
      const channel = asString(p.channel);
      const videoId = asString(p.videoId);
      let iframeSrc = "";

      if ((platform === "twitch" || section.type === "twitch-stream") && channel) {
        iframeSrc = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=localhost`;
      } else if (
        (platform === "youtube" || section.type === "youtube-stream") &&
        videoId
      ) {
        iframeSrc = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
      } else {
        iframeSrc = asString(p.embedUrl ?? p.videoUrl);
      }

      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Stream"} description={description} />
          {channel ? (
            <p className="mb-2 text-sm text-zinc-500">Channel: {channel}</p>
          ) : null}
          {iframeSrc ? (
            <div className="aspect-video overflow-hidden rounded-md bg-zinc-900">
              <iframe
                title={heading || "Stream"}
                src={iframeSrc}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md bg-zinc-200 text-sm text-zinc-500">
              Add stream channel or video ID
            </div>
          )}
        </Shell>
      );
    }

    case "game-logo":
      return (
        <Shell
          section={section}
          className={`flex flex-col items-center gap-3 ${className ?? ""}`}
        >
          <ImagePlaceholder
            src={imageUrl}
            alt={asString(p.alt, asString(p.game, "Game"))}
            className="h-24 w-24 rounded-md bg-zinc-200 object-contain"
          />
          <p className="font-medium text-zinc-900">
            {heading || asString(p.game, "Game")}
          </p>
        </Shell>
      );

    case "registration-cta":
      return (
        <Shell section={section} className={className}>
          <HeadingBlock heading={heading || "Register"} description={description} />
          <Buttons
            buttons={p.buttons}
            single={{
              label: asString(p.buttonLabel, "Register"),
              href: asString(p.buttonHref, "#"),
            }}
          />
        </Shell>
      );

    default:
      return (
        <Shell
          section={section}
          className={`rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4 ${className ?? ""}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {section.type}
          </p>
          {heading ? (
            <h3 className="mt-2 text-lg font-semibold text-zinc-900">{heading}</h3>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-zinc-600">{description}</p>
          ) : null}
        </Shell>
      );
  }
}
