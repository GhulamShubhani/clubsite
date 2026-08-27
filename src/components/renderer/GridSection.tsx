import type { ReactNode } from "react";
import type { RenderDevice } from "./PageRenderer";
import { site } from "./site-classes";

export type GridVariant =
  | "cards"
  | "image-top"
  | "image-left"
  | "overlay"
  | "minimal"
  | "featured";

export type GridItemMediaType = "none" | "image" | "video";

export type GridItem = {
  title?: string;
  body?: string;
  description?: string;
  heading?: string;
  name?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: GridItemMediaType;
  href?: string;
};

type GridSectionProps = {
  heading?: string;
  description?: string;
  items: GridItem[];
  variant?: GridVariant;
  columns?: number;
  device?: RenderDevice;
};

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function itemTitle(item: GridItem): string {
  return asString(item.title ?? item.heading ?? item.name, "Item");
}

function itemBody(item: GridItem): string {
  return asString(item.body ?? item.description);
}

function itemMediaType(item: GridItem): GridItemMediaType {
  const explicit = asString(item.mediaType);
  if (explicit === "image" || explicit === "video" || explicit === "none") {
    return explicit;
  }
  if (asString(item.videoUrl)) return "video";
  if (asString(item.imageUrl)) return "image";
  return "none";
}

function columnClass(columns: number, compact: boolean): string {
  if (compact) return "grid-cols-1";
  const cols = Math.min(Math.max(columns, 1), 6);
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "sm:grid-cols-2";
    case 3:
      return "sm:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "sm:grid-cols-2 lg:grid-cols-4";
    case 5:
      return "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    default:
      return "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
  }
}

function GridMedia({
  item,
  className = "aspect-video w-full rounded-md bg-zinc-200 object-cover",
  overlay = false,
}: {
  item: GridItem;
  className?: string;
  overlay?: boolean;
}) {
  const media = itemMediaType(item);
  const imageUrl = asString(item.imageUrl);
  const videoUrl = asString(item.videoUrl);

  if (media === "image" && imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={itemTitle(item)} className={className} />;
  }

  if (media === "video" && videoUrl) {
    const isEmbed =
      videoUrl.includes("youtube.com") ||
      videoUrl.includes("youtu.be") ||
      videoUrl.includes("vimeo.com") ||
      videoUrl.includes("/embed");

    if (isEmbed) {
      return (
        <div className={`${className} overflow-hidden bg-zinc-900`}>
          <iframe
            title={itemTitle(item)}
            src={videoUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        src={videoUrl}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        aria-label={itemTitle(item)}
      />
    );
  }

  if (overlay) return null;

  return (
    <div
      className={`${className} flex items-center justify-center text-sm text-zinc-400`}
      aria-hidden
    >
      No media
    </div>
  );
}

function ItemShell({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <a href={href} className={`block transition hover:opacity-95 ${className ?? ""}`}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

function GridItemContent({
  item,
  variant,
  featured = false,
}: {
  item: GridItem;
  variant: GridVariant;
  featured?: boolean;
}) {
  const title = itemTitle(item);
  const body = itemBody(item);
  const href = asString(item.href) || undefined;
  const hasMedia = itemMediaType(item) !== "none";

  if (variant === "overlay") {
    return (
      <ItemShell
        href={href}
        className={`group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] ${
          featured ? "min-h-[280px]" : "min-h-[220px]"
        }`}
      >
        <div className="absolute inset-0">
          <GridMedia
            item={item}
            className="h-full w-full object-cover"
            overlay
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-4 text-white">
          <h3 className={`font-semibold ${featured ? "text-xl" : "text-lg"}`}>
            {title}
          </h3>
          {body ? <p className="mt-1 text-sm text-white/85">{body}</p> : null}
        </div>
      </ItemShell>
    );
  }

  if (variant === "image-left") {
    return (
      <ItemShell
        href={href}
        className={`flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] sm:flex-row`}
      >
        {hasMedia ? (
          <div className="sm:w-2/5">
            <GridMedia
              item={item}
              className="aspect-video h-full w-full object-cover sm:aspect-auto sm:min-h-[140px]"
            />
          </div>
        ) : null}
        <div className={`flex flex-1 flex-col justify-center p-4 ${hasMedia ? "" : "w-full"}`}>
          <h3 className={site.h3}>{title}</h3>
          {body ? <p className={`mt-1 ${site.muted}`}>{body}</p> : null}
        </div>
      </ItemShell>
    );
  }

  if (variant === "minimal") {
    return (
      <ItemShell href={href} className="space-y-2">
        {hasMedia ? (
          <GridMedia
            item={item}
            className="aspect-[4/3] w-full rounded-md bg-zinc-100 object-cover"
          />
        ) : null}
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        {body ? <p className="text-sm leading-relaxed text-zinc-600">{body}</p> : null}
      </ItemShell>
    );
  }

  if (variant === "image-top") {
    return (
      <ItemShell href={href} className="overflow-hidden rounded-lg bg-white">
        {hasMedia ? (
          <GridMedia
            item={item}
            className="aspect-video w-full rounded-t-lg bg-zinc-200 object-cover"
          />
        ) : null}
        <div className="p-4">
          <h3 className={site.h3}>{title}</h3>
          {body ? <p className={`mt-1 ${site.muted}`}>{body}</p> : null}
        </div>
      </ItemShell>
    );
  }

  // cards (default) and featured use card styling
  return (
    <ItemShell
      href={href}
      className={`overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] ${
        featured ? "p-6" : "p-4"
      }`}
    >
      {hasMedia ? (
        <GridMedia
          item={item}
          className={`mb-3 aspect-video w-full rounded-md bg-zinc-200 object-cover ${
            featured ? "aspect-[16/10]" : ""
          }`}
        />
      ) : null}
      <h3 className={`font-semibold text-zinc-900 ${featured ? "text-xl" : ""}`}>
        {title}
      </h3>
      {body ? <p className="mt-1 text-sm text-zinc-600">{body}</p> : null}
    </ItemShell>
  );
}

function HeadingBlock({
  heading,
  description,
}: {
  heading?: string;
  description?: string;
}) {
  if (!heading && !description) return null;
  return (
    <div className="mb-4">
      {heading ? (
        <h2 className={site.h2}>
          {heading}
        </h2>
      ) : null}
      {description ? (
        <p className={`mt-2 ${site.body}`}>{description}</p>
      ) : null}
    </div>
  );
}

export function GridSection({
  heading,
  description,
  items,
  variant = "cards",
  columns = 3,
  device = "desktop",
}: GridSectionProps) {
  const compact = device === "mobile" || device === "tablet";
  const resolvedVariant: GridVariant =
    variant === "featured" ? "featured" : variant;
  const colClass = columnClass(columns, compact);

  if (items.length === 0) {
    return (
      <div>
        <HeadingBlock heading={heading} description={description} />
        <p className="text-sm text-zinc-500">Add grid items in the builder.</p>
      </div>
    );
  }

  return (
    <div>
      <HeadingBlock heading={heading} description={description} />
      <div className={`grid gap-4 ${colClass}`}>
        {items.map((item, index) => {
          const isFeatured =
            resolvedVariant === "featured" && index === 0 && !compact;
          return (
            <div
              key={index}
              className={
                isFeatured
                  ? "sm:col-span-2 lg:row-span-2"
                  : undefined
              }
            >
              <GridItemContent
                item={item}
                variant={
                  resolvedVariant === "featured" && index === 0
                    ? "overlay"
                    : resolvedVariant === "featured"
                      ? "cards"
                      : resolvedVariant
                }
                featured={isFeatured}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
