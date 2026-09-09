"use client";

import { createContext, useContext, type ReactNode } from "react";

type PublicSiteValue = {
  /** Prefix for in-site links, e.g. `/club/my-club`. Empty on subdomain hosts. */
  basePath: string;
  /** Club slug for public APIs such as the match calendar. */
  tenantSlug: string;
};

const PublicSiteContext = createContext<PublicSiteValue>({
  basePath: "",
  tenantSlug: "",
});

export function PublicSiteProvider({
  basePath,
  tenantSlug = "",
  children,
}: {
  basePath: string;
  tenantSlug?: string;
  children: ReactNode;
}) {
  return (
    <PublicSiteContext.Provider value={{ basePath, tenantSlug }}>
      {children}
    </PublicSiteContext.Provider>
  );
}

export function usePublicSite(): PublicSiteValue {
  return useContext(PublicSiteContext);
}
