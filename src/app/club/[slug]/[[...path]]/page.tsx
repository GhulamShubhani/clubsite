import type { Metadata } from "next";
import {
  PublicClubPageView,
  publicClubMetadata,
} from "@/components/public/PublicClubPage";

type Props = { params: Promise<{ slug: string; path?: string[] }> };

function pagePathFromSegments(segments?: string[]) {
  return !segments || segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, path: segments } = await params;
  return publicClubMetadata({ slug, pagePath: pagePathFromSegments(segments) });
}

/**
 * Public club site via path URL — works on Vercel without wildcard subdomains.
 * Example: /club/test1 or /club/test1/about
 */
export default async function ClubPublicPage({ params }: Props) {
  const { slug, path: segments } = await params;
  return (
    <PublicClubPageView
      slug={slug}
      pagePath={pagePathFromSegments(segments)}
    />
  );
}
