"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="space-y-8 mx-auto px-4 py-6 container">
            {/* Header Section */}
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <div className="mb-2 w-48 h-8">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="w-64 h-5">
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-32 h-10" />
                </div>
            </div>
            <div className="w-72 h-5">
                <Skeleton className="w-full h-full" />
            </div>

            {/* Metric Cards */}
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={`metric-${index}`} className="h-full">
                        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                            <CardTitle className="font-medium">
                                <Skeleton className="w-32 h-6" />
                            </CardTitle>
                            <Skeleton className="rounded-full w-6 h-6" />
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2">
                                <Skeleton className="mb-2 w-20 h-8" />
                            </div>
                            <Skeleton className="w-full h-4" />
                            <div className="mt-6">
                                <Skeleton className="w-28 h-8" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Stat Cards */}
            <div className="gap-6 grid md:grid-cols-2 mt-8">
                {[...Array(2)].map((_, index) => (
                    <Card key={`stat-${index}`}>
                        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                            <CardTitle className="font-medium">
                                <Skeleton className="w-32 h-6" />
                            </CardTitle>
                            <Skeleton className="rounded-full w-6 h-6" />
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2">
                                <Skeleton className="mb-2 w-20 h-8" />
                            </div>
                            <Skeleton className="w-full h-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* User Manual Section */}
            <div className="mt-8">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium">
                            <Skeleton className="w-32 h-6" />
                        </CardTitle>
                        <Skeleton className="rounded-full w-6 h-6" />
                    </CardHeader>
                    <CardContent>
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, index) => (
                                <div key={`manual-${index}`} className="p-3 border rounded-lg">
                                    <Skeleton className="mb-2 w-32 h-5" />
                                    <Skeleton className="mb-1 w-full h-4" />
                                    <Skeleton className="mb-1 w-full h-4" />
                                    <Skeleton className="w-3/4 h-4" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
