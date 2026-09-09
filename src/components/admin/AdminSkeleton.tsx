function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200 ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function AdminCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <Pulse className="h-5 w-40" />
          <Pulse className="mt-2 h-3 w-24" />
          <Pulse className="mt-4 h-16 w-full" />
          <div className="mt-4 flex gap-2">
            <Pulse className="h-10 flex-1" />
            <Pulse className="h-10 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Pulse className="h-4 w-48 max-w-full" />
            <Pulse className="h-3 w-32" />
          </div>
          <Pulse className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AdminCardGridSkeleton({
  count = 6,
  columns = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div
      className={`grid gap-4 ${columns}`}
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <div className="flex gap-4">
            <Pulse className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-3 w-1/2" />
            </div>
          </div>
          <Pulse className="mt-4 h-3 w-full" />
          <Pulse className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <div
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4"
      aria-busy="true"
      aria-label="Loading"
    >
      <Pulse className="h-4 w-28" />
      <Pulse className="h-10 w-full" />
      <Pulse className="h-4 w-28" />
      <Pulse className="h-10 w-full" />
      <Pulse className="h-10 w-24" />
    </div>
  );
}

export function AdminStatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-3"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-lg border border-zinc-200 bg-white p-4"
        >
          <Pulse className="h-3 w-20" />
          <Pulse className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
