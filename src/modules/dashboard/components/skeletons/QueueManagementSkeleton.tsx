"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function QueueManagementSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
            <Skeleton className="h-10 w-full sm:w-44" />
            <Skeleton className="h-10 w-full sm:w-44" />
            <Skeleton className="h-10 w-full sm:w-36" />
            <Skeleton className="h-9 w-full sm:w-52" />
            <Skeleton className="h-10 w-full sm:w-36" />
          </div>
        </div>
      </div>

      <Card className="border-border/80 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>
            <Skeleton className="w-40 h-6" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="w-64 h-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <div className="gap-x-4 grid grid-cols-8 bg-muted/50 p-4">
              <Skeleton className="w-12 h-6" />
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-36 h-6" />
              <Skeleton className="w-20 h-6" />
              <Skeleton className="w-28 h-6" />
              <Skeleton className="w-28 h-6" />
              <Skeleton className="w-24 h-6" />
              <Skeleton className="ml-auto w-24 h-6" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={`row-${i}`} className="gap-x-4 grid grid-cols-8 p-4 border-t">
                <Skeleton className="w-10 h-6" />
                <div className="space-y-2">
                  <Skeleton className="w-28 h-5" />
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-16 h-6" />
                <div className="flex items-center">
                  <Skeleton className="rounded-full w-24 h-7" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="w-10 h-6" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="w-20 h-6" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Skeleton className="rounded-md w-20 h-9" />
                  <Skeleton className="rounded-md w-24 h-9" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
