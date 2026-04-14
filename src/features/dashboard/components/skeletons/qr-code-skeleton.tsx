"use client";

import { PageContainer } from "@/components/shared/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function QRCodeSkeleton() {
    return (
        <PageContainer className="dashboard-page">
            <section className="dashboard-hero space-y-4 p-4 sm:p-5">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-7 w-56" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-full sm:w-36" />
                    <Skeleton className="h-10 w-full sm:w-36" />
                    <Skeleton className="h-10 w-full sm:w-40" />
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
                <div className="dashboard-panel space-y-4 p-4 sm:p-5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-full" />
                    <div className="rounded-xl border border-border/80 bg-background/70 p-3">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="dashboard-panel space-y-4 p-4 sm:p-5">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-28 w-full" />
                    </div>

                    <div className="dashboard-panel space-y-4 p-4 sm:p-5">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-10/12" />
                        <Skeleton className="h-4 w-9/12" />
                    </div>
                </div>
            </section>
        </PageContainer>
    );
}
