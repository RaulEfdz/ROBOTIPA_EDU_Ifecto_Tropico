// File: app/(course)/courses/catalog/components/LoadingSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="border dark:border-slate-700 rounded-lg p-4 space-y-3 animate-pulse bg-white dark:bg-slate-800"
        >
          <Skeleton className="aspect-video w-full rounded-md bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-8 w-1/3 mt-2 bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
