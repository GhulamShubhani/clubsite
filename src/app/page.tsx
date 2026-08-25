import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { getRequestTenant } from "@/lib/tenant/request";
import { getPublishedPageByPath } from "@/lib/pages/versions";
import type { PageContent } from "@/lib/page-schema";
import { PageRenderer } from "@/components/renderer/PageRenderer";
import { SiteNavbar } from "@/components/renderer/SiteNavbar";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import {
  buildPublicMetadata,
  getPublicSiteBundle,
  shouldPrependSiteNavbar,
} from "@/lib/tenant/public-site";

export async function generateMetadata(): Promise<Metadata> {
  const resolution = await getRequestTenant();
  if (resolution.kind !== "tenant") {
    return {
      title: "Clubshop — Gaming Club Website Platform",
      description:
        "Create a professional gaming club site without code. Each club gets an isolated workspace and its own subdomain.",
    };
  }

  const bundle = await getPublicSiteBundle(resolution.tenant.id);
  if (!bundle) {
    return { title: resolution.tenant.name };
  }

  const published = await getPublishedPageByPath(resolution.tenant.id, "/");
  return buildPublicMetadata(bundle, published?.page ?? null);
}

export default async function HomePage() {
  const resolution = await getRequestTenant();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";

  if (resolution.kind === "tenant") {
    const bundle = await getPublicSiteBundle(resolution.tenant.id);
    const published = await getPublishedPageByPath(resolution.tenant.id, "/");
    const content = (published?.published.content ?? {
      sections: [],
    }) as PageContent;
    const prependNav =
      Boolean(bundle) &&
      published &&
      shouldPrependSiteNavbar(content.sections);

    return (
      <main className="min-h-full w-full">
        <TrackPageView path="/" />
        {published ? (
          <>
            {prependNav && bundle ? (
              <SiteNavbar
                brand={bundle.website.name}
                items={bundle.navigationItems}
              />
            ) : null}
            <PageRenderer
              content={content}
              themeTokens={bundle?.themeTokens}
            />
            <p className="mx-auto max-w-3xl px-6 py-4 text-xs text-zinc-400">
              Published v{published.published.version}
            </p>
          </>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col justify-center gap-6 px-6 py-16">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Public club site · published only
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
              {bundle?.website.seoTitle ?? resolution.tenant.name}
            </h1>
            <p className="text-lg text-zinc-600">
              This club has not published a live homepage yet. Draft edits stay
              private until Publish.
            </p>
            <p className="rounded-lg bg-zinc-100 px-4 py-3 font-mono text-sm text-zinc-700">
              Resolved from hostname <strong>{host}</strong> → slug{" "}
              <strong>{resolution.tenant.slug}</strong>
            </p>
            <Link
              href="/admin"
              className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Club admin
            </Link>
          </div>
        )}
      </main>
    );
  }

  if (resolution.kind === "unknown_tenant") {
    return (
      <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Club not found</h1>
        <p className="text-zinc-600">
          No club is registered for this address.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Clubshop platform
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        Gaming Club Website Platform
      </h1>
      <p className="text-lg text-zinc-600">
        Create a professional gaming club site without code. Each club gets an
        isolated workspace and its own subdomain.
      </p>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Create your website
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
        >
          Log in
        </Link>
      </div>
      <p className="font-mono text-xs text-zinc-500">
        Platform host: {host}
      </p>
    </main>
  );
}
