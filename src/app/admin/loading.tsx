import { AdminCardsSkeleton } from "@/components/admin/AdminSkeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded-md bg-zinc-200" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-zinc-200" />
      </div>
      <AdminCardsSkeleton />
    </div>
  );
}
