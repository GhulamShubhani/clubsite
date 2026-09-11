import Link from "next/link";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { PlatformFooter, PlatformHeader } from "./PlatformChrome";

const FEATURES = [
  {
    title: "Ready-made club sites",
    body: "Start from a full template — teams, events, calendar, and contact — then make it yours.",
    icon: "◆",
  },
  {
    title: "Edit without code",
    body: "Change text, photos, and buttons in the builder. Duplicate sections. Publish when it looks right.",
    icon: "✎",
  },
  {
    title: "Live in one click",
    body: "Your club gets its own web address. Visitors see the published site. Drafts stay private.",
    icon: "▶",
  },
  {
    title: "Messages to your inbox",
    body: "When someone fills a form, you read it in Admin → Messages. Name, email, and their note.",
    icon: "✉",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your club",
    body: "Pick a name and a short website address. You land in a simple admin dashboard.",
  },
  {
    n: "02",
    title: "Choose a template",
    body: "Apply a full website. Every page is already filled with sample content you can replace.",
  },
  {
    n: "03",
    title: "Publish and share",
    body: "Hit Publish. Send the live link to members. Matches and messages update automatically.",
  },
];

const ACCENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-400 to-sky-500",
  "from-fuchsia-500 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-violet-500",
  "from-rose-400 to-pink-500",
  "from-blue-400 to-cyan-400",
];

const GAMES = [
  "Valorant",
  "CS2",
  "League of Legends",
  "Rocket League",
  "Street Fighter",
  "Apex Legends",
  "Dota 2",
  "Fortnite",
];

type Props = { host: string };

export function PlatformLanding({ host }: Props) {
  return (
    <div className="platform-home relative flex min-h-screen flex-col overflow-hidden bg-[#070712] text-zinc-50">
      <div className="platform-aurora pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex min-h-screen flex-1 flex-col">
        <PlatformHeader />

        <main className="flex-1">
          <section className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Clubshop platform
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your club website,
                <span className="mt-1 block bg-linear-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  live in minutes.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">
                Build a professional gaming club site without writing code. Pick a
                template, edit in the builder, and publish — matches, events, and
                visitor messages all show up in admin.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(168,85,247,0.45)] transition hover:brightness-110"
                >
                  Create your website
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
                >
                  Log in
                </Link>
              </div>
              <p className="mt-6 text-xs text-zinc-500">
                Isolated workspace · Your own club link · No coding
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-linear-to-br from-violet-500/25 via-fuchsia-500/10 to-cyan-400/20 blur-2xl" />
              <div className="platform-float relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 font-mono text-[11px] text-zinc-500">
                    /club/your-club
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Neon Vipers</p>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      Live
                    </span>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    Tonight’s match
                  </p>
                  <div className="grid grid-cols-3 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                    <div>
                      <p className="text-xs text-zinc-400">Vipers</p>
                      <p className="mt-1 text-2xl font-bold text-white">2</p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-300">
                      vs
                    </p>
                    <div>
                      <p className="text-xs text-zinc-400">Aether</p>
                      <p className="mt-1 text-2xl font-bold text-white">1</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {["Today", "Tomorrow", "Sat"].map((label, i) => (
                      <div
                        key={label}
                        className={`rounded-xl border px-2 py-3 text-center ${
                          i === 0
                            ? "border-violet-400/40 bg-violet-500/20 text-white"
                            : "border-white/10 bg-white/5 text-zinc-400"
                        }`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="relative border-y border-white/10 bg-white/[0.03] py-4">
            <div className="platform-marquee flex gap-10 whitespace-nowrap text-sm font-medium tracking-wide text-zinc-500">
              {[...GAMES, ...GAMES].map((game, i) => (
                <span key={`${game}-${i}`} className="flex items-center gap-10">
                  {game}
                  <span className="text-violet-500/70">●</span>
                </span>
              ))}
            </div>
          </div>

          <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
              Why clubs use it
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Everything a club site needs
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-violet-400/40 hover:bg-white/[0.07]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-cyan-400 text-sm text-white">
                    {feature.icon}
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Templates
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Start with a full website
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Each template is a complete club site you can apply, then edit. No
              empty pages.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATE_CATALOG.map((template, index) => (
                <article
                  key={template.key}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                >
                  <div
                    className={`h-1.5 bg-linear-to-r ${ACCENTS[index % ACCENTS.length]}`}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                      {template.description}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-wider text-zinc-500">
                      {template.pages.length} pages
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Three steps. Then you’re live.
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <p className="font-mono text-sm text-fuchsia-300">{step.n}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="px-5 pb-24 sm:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-violet-400/20 bg-linear-to-br from-violet-600/30 via-fuchsia-600/15 to-cyan-500/10 px-8 py-12 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to launch your club?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-zinc-300">
                Create a workspace, apply a template, and share your live link.
                You can change everything later.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
                >
                  Create your website
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Log in to admin
                </Link>
              </div>
            </div>
          </section>
        </main>

        <PlatformFooter host={host} />
      </div>
    </div>
  );
}
