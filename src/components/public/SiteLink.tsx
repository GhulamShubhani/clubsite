"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { isExternalHref, resolveSiteHref } from "@/lib/tenant/public-href";
import { usePublicSite } from "./PublicSiteContext";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** In-site links navigate without a full reload (SPA-style). */
export function SiteLink({ href, className, children, onClick }: Props) {
  const { basePath } = usePublicSite();
  const resolved = resolveSiteHref(href, basePath);

  if (isExternalHref(resolved) || resolved.startsWith("#")) {
    return (
      <a href={resolved} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={resolved} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
