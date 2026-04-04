"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-md">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={`metric-${index}`} className="border-border/80 bg-card/80 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                        <CardFooter className="border-t border-border/70 pt-3">
                            <Skeleton className="h-6 w-24" />
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {[...Array(2)].map((_, index) => (
                    <Card key={`avg-${index}`} className="border-border/80 bg-card/80 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-9 w-9 rounded-full" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {[...Array(2)].map((_, index) => (
                    <Card key={`admin-${index}`} className="border-border/80 bg-card/80 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-9 w-9 rounded-full" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-7 w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/80 bg-card/80 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div key={`manual-${index}`} className="rounded-xl border border-border/70 bg-background/60 p-4">
                                <Skeleton className="mb-2 h-4 w-32" />
                                <Skeleton className="mb-1 h-3 w-full" />
                                <Skeleton className="mb-1 h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
