"use client";

import { useEffect } from "react";

/**
 * Full-screen builder overlay. Keeps admin chrome underneath,
 * locks document scroll, and fills the viewport so panels can scroll.
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
