"use client";

type LiveSiteCardProps = {
  clubName: string;
  slug: string;
  publicUrl: string;
};

export function LiveSiteCard({ clubName, slug, publicUrl }: LiveSiteCardProps) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      /* clipboard may be blocked */
    }
  }

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <h2 className="font-medium text-zinc-900">Your live website</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Website short name:{" "}
        <strong className="font-mono text-zinc-900">{slug}</strong>
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        This is the simple name you chose for {clubName}. Share the link below
        so visitors can open your club site in one click.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Open my website
        </a>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="cursor-pointer rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Copy link
        </button>
      </div>
      <p className="mt-3 break-all font-mono text-xs text-emerald-900">
        {publicUrl}
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Publish pages from Admin → Pages before sharing. Preview in admin shows
        drafts; this link shows the live published site.
      </p>
    </section>
  );
}
