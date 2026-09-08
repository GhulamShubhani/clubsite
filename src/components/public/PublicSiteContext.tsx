"use client";

import { createContext, useContext, type ReactNode } from "react";

type PublicSiteValue = {
  /** Prefix for in-site links, e.g. `/club/my-club`. Empty on subdomain hosts. */
  basePath: string;
};

const PublicSiteContext = createContext<PublicSiteValue>({ basePath: "" });

export function PublicSiteProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: ReactNode;
}) {
  return (
    <PublicSiteContext.Provider value={{ basePath }}>
      {children}
    </PublicSiteContext.Provider>
  );
}

export function usePublicSite(): PublicSiteValue {
  return useContext(PublicSiteContext);
}
