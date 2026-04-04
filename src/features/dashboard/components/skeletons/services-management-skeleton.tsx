"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesManagementSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full sm:col-span-2 lg:col-span-1" />
        </div>
      </div>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="gap-2">
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Skeleton className="h-10 w-full lg:w-80" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="hidden space-y-3 md:block">
            {[...Array(4)].map((_, idx) => (
              <div
                key={`row-${idx}`}
                className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] gap-3 rounded-xl border border-border/70 bg-muted/40 p-4"
              >
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 md:hidden">
            {[...Array(3)].map((_, idx) => (
              <div key={`card-${idx}`} className="rounded-xl border border-border/70 bg-muted/40 p-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-24" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
