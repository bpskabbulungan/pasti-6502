"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersManagementSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-72" />
                            <Skeleton className="h-5 w-96 max-w-full" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[260px] lg:w-[340px]">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="col-span-2 h-24 w-full rounded-xl" />
                    </div>
                </div>
            </div>

            <Card className="border-border/80 shadow-md">
                <CardHeader className="gap-2">
                    <CardTitle>
                        <Skeleton className="h-6 w-48" />
                    </CardTitle>
                    <Skeleton className="h-4 w-80 max-w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <Skeleton className="h-10 w-full lg:w-96" />
                            <div className="flex flex-wrap items-center gap-3">
                                <Skeleton className="h-9 w-40" />
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-9 w-28" />
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-44" />
                        </div>
                    </div>

                    <Skeleton className="h-16 w-full rounded-xl" />

                    <div className="space-y-3">
                        {[...Array(3)].map((_, idx) => (
                            <div
                                key={`row-skeleton-${idx}`}
                                className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 rounded-xl border border-border/70 bg-muted/40 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-24" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="h-9 w-20 rounded-md" />
                                    <Skeleton className="h-9 w-20 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
