"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UIShowcaseSkeleton() {
    return (
        <div className="space-y-10 mx-auto px-4 py-8 container">
            {/* Header */}
            <header className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Skeleton className="mb-2 w-48 h-8" />
                    <Skeleton className="w-64 h-5" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="rounded-full w-8 h-8" />
                    <Skeleton className="w-32 h-8" />
                </div>
            </header>

            {/* Theme Colors Showcase */}
            <section className="mb-12">
                <Skeleton className="mb-4 w-48 h-8" />
                <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
                    {Array(8).fill(0).map((_, i) => (
                        <Skeleton key={`color-${i}`} className="rounded-md h-20" />
                    ))}
                </div>
            </section>

            {/* Theme Usage Examples */}
            <section className="mb-12">
                <Skeleton className="mb-4 w-48 h-8" />
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    <Skeleton className="rounded-md h-40" />
                    <Skeleton className="rounded-md h-40" />
                </div>
            </section>

            {/* UI Components */}
            <section className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, i) => (
                    <Card key={`component-${i}`} className="shadow-md border">
                        <CardHeader>
                            <Skeleton className="mb-2 w-32 h-6" />
                            <Skeleton className="w-48 h-4" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                {Array(3).fill(0).map((_, j) => (
                                    <Skeleton key={`button-${i}-${j}`} className="w-20 h-10" />
                                ))}
                            </div>
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}
