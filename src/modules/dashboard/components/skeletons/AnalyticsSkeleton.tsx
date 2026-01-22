"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="mb-2 w-64 h-8">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="w-80 h-5">
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="w-32 h-10" />
                    <Skeleton className="w-32 h-10" />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={`summary-${index}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="font-medium text-sm">
                                <Skeleton className="w-32 h-5" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-20 h-8" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="gap-4 grid md:grid-cols-2">
                {/* Service Distribution Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Skeleton className="mr-2 rounded-full w-6 h-6" />
                            <Skeleton className="w-36 h-6" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="w-64 h-4" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <div className="flex justify-center items-center h-full">
                            <div className="relative rounded-full w-48 h-48 overflow-hidden">
                                <Skeleton className="absolute inset-0" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Performance Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Skeleton className="mr-2 rounded-full w-6 h-6" />
                            <Skeleton className="w-36 h-6" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="w-64 h-4" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <div className="flex flex-col justify-center space-y-2 h-full">
                            {[...Array(5)].map((_, i) => (
                                <div key={`bar-${i}`} className="flex items-center space-x-2">
                                    <Skeleton className="w-20 h-5" />
                                    <div className="flex-grow h-6">
                                        <Skeleton className={`h-full w-${Math.floor(Math.random() * 90 + 10)}%`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Trends Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="w-36 h-6" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="w-64 h-4" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="flex flex-col space-y-4 h-full">
                        <div className="flex justify-between">
                            <Skeleton className="w-12 h-5" />
                            <Skeleton className="w-12 h-5" />
                            <Skeleton className="w-12 h-5" />
                            <Skeleton className="w-12 h-5" />
                            <Skeleton className="w-12 h-5" />
                        </div>
                        <div className="relative flex-grow">
                            <div className="absolute inset-0">
                                {[...Array(5)].map((_, i) => (
                                    <div key={`trend-${i}`} className="bottom-0 absolute w-1/6 h-1/3" style={{ left: `${i * 20}%` }}>
                                        <Skeleton className={`h-${Math.floor(Math.random() * 90 + 10)}% w-8 mx-auto`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Peak Hours Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="w-36 h-6" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="w-64 h-4" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <div className="flex justify-between items-end pb-10 h-full">
                        {[...Array(8)].map((_, i) => (
                            <div key={`hour-${i}`} className="flex flex-col items-center">
                                <div className="h-full" style={{ height: `${Math.floor(Math.random() * 50 + 30)}%` }}>
                                    <Skeleton className="w-10 h-full" />
                                </div>
                                <Skeleton className="mt-2 w-12 h-4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
