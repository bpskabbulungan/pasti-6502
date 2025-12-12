"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersManagementSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <div className="mb-2 w-48 h-8">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="w-64 h-5">
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>
                <Skeleton className="w-32 h-10" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="w-40 h-6" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden">
                        <div className="gap-x-4 grid grid-cols-5 bg-muted/50 p-4">
                            <Skeleton className="w-32 h-6" />
                            <Skeleton className="w-28 h-6" />
                            <Skeleton className="w-24 h-6" />
                            <Skeleton className="w-32 h-6" />
                            <Skeleton className="ml-auto w-16 h-6" />
                        </div>

                        {[...Array(5)].map((_, i) => (
                            <div key={`row-${i}`} className="gap-x-4 grid grid-cols-5 p-4 border-t">
                                <Skeleton className="w-36 h-6" />
                                <Skeleton className="w-24 h-6" />
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="rounded-full w-4 h-4" />
                                    <Skeleton className="w-16 h-6" />
                                </div>
                                <Skeleton className="w-28 h-6" />
                                <div className="flex justify-end space-x-2">
                                    <Skeleton className="rounded-md w-20 h-9" />
                                    <Skeleton className="rounded-md w-20 h-9" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
