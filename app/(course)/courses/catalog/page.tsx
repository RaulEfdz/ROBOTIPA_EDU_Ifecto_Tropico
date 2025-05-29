"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CatalogContent from "./components/CatalogContent";

export default function CatalogPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
          <div className="bg-white dark:bg-slate-900 shadow-md h-16 animate-pulse"></div>
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center py-8 mb-8 bg-slate-200 dark:bg-slate-700 rounded-lg h-36 animate-pulse"></div>
            <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow h-40 animate-pulse"></div>
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
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
