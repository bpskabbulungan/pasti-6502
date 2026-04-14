"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsSkeleton() {
    return (
        <PageContainer maxWidth="6xl">
            {/* Header - matches guestbook/other dashboard pages */}
            <div className="dashboard-hero p-4 sm:p-5">
                <div className="space-y-3.5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Title + meta */}
                        <div className="min-w-0 flex-1 space-y-2.5">
                            <div className="space-y-1.5">
                                <Skeleton className="h-7 w-64" />
                                <Skeleton className="h-4 w-80 max-w-full" />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-5 w-28 rounded-full" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-28 rounded-md" />
                                <Skeleton className="h-6 w-48 rounded-md" />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Skeleton className="h-9 w-36 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter panel */}
            <div className="dashboard-filter-panel">
                <div className="flex flex-wrap gap-3">
                    <div className="space-y-1.5">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-10 w-36 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-10 w-36 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {/* Tabs skeleton */}
                <Skeleton className="h-10 w-72 rounded-lg" />

                {/* Summary cards */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="border-border/80 shadow-none">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-7 w-20" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Chart row */}
                <div className="grid gap-4 xl:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-border/80 shadow-none">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-5 w-36" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent className="pb-6">
                                <Skeleton className="h-72 w-full rounded-xl" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
}