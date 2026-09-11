import type { ReactNode } from "react";
import Link from "next/link";

export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070712]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-xs font-black text-white shadow-[0_0_24px_rgba(168,85,247,0.55)]">
            C
          </span>
          <span className="text-sm font-semibold tracking-wide text-white">
            Clubshop
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] transition hover:brightness-110"
          >
            Create your website
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PlatformFooter({ host }: { host?: string }) {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Clubshop · Gaming club websites without code</p>
        {host ? (
          <p className="font-mono text-xs text-zinc-600">Host · {host}</p>
        ) : null}
      </div>
    </footer>
  );
}

export function PlatformAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="platform-home relative flex min-h-screen flex-col overflow-hidden bg-[#070712] text-zinc-50">
      <div className="platform-aurora pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex min-h-screen flex-1 flex-col">
        <PlatformHeader />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
          {children}
        </div>
        <PlatformFooter />
      </div>
    </div>
  );
}
