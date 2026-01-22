"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllQueuesSkeleton() {
    return (
        <div className="space-y-4">
            <div>
                <div className="mb-2 w-48 h-8">
                    <Skeleton className="w-full h-full" />
                </div>
                <div className="w-64 h-5">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>

            <Card className="p-5">
                <div className="flex md:flex-row flex-col justify-between gap-4 mb-6">
                    <div className="flex md:flex-row flex-col gap-4">
                        <div className="relative">
                            <Skeleton className="w-[300px] h-10" />
                        </div>
                        <div>
                            <Skeleton className="w-32 h-10" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="w-32 h-10" />
                        <Skeleton className="w-10 h-10" />
                    </div>
                </div>

                <div className="mb-4 w-3/4 h-5">
                    <Skeleton className="w-full h-full" />
                </div>

                <div className="border rounded-md overflow-hidden">
                    <div className="gap-x-4 grid grid-cols-8 bg-muted/50 p-4">
                        <Skeleton className="w-16 h-6" />
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-24 h-6" />
                        <Skeleton className="w-20 h-6" />
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-24 h-6" />
                        <Skeleton className="w-24 h-6" />
                        <Skeleton className="ml-auto w-20 h-6" />
                    </div>

                    {[...Array(10)].map((_, i) => (
                        <div key={`row-${i}`} className="gap-x-4 grid grid-cols-8 p-4 border-t">
                            <Skeleton className="w-10 h-6" />
                            <Skeleton className="w-28 h-6" />
                            <Skeleton className="w-20 h-6" />
                            <div>
                                <Skeleton className="rounded-full w-24 h-7" />
                            </div>
                            <Skeleton className="w-32 h-6" />
                            <div>
                                <Skeleton className="rounded-full w-24 h-7" />
                            </div>
                            <Skeleton className="w-20 h-6" />
                            <div className="flex justify-end">
                                <Skeleton className="rounded-md w-20 h-9" />
                            </div>
                        </div>
                    ))}
                </div>

                <CardContent>
                    <div className="flex justify-between items-center mt-4 px-2">
                        <div>
                            <Skeleton className="w-64 h-5" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="rounded-md w-10 h-9" />
                            <Skeleton className="rounded-md w-10 h-9" />
                            <Skeleton className="w-32 h-5" />
                            <Skeleton className="rounded-md w-10 h-9" />
                            <Skeleton className="rounded-md w-10 h-9" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
