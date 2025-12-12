"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QueueManagementSkeleton() {
    return (
        <div className="space-y-4">
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

            <div className="w-72 h-5">
                <Skeleton className="w-full h-full" />
            </div>

            <Tabs defaultValue="waiting" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="waiting">
                        <Skeleton className="w-20 h-6" />
                    </TabsTrigger>
                    <TabsTrigger value="serving">
                        <Skeleton className="w-32 h-6" />
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        <Skeleton className="w-20 h-6" />
                    </TabsTrigger>
                    <TabsTrigger value="canceled">
                        <Skeleton className="w-24 h-6" />
                    </TabsTrigger>
                </TabsList>

                {/* Queue Tab Content */}
                <TabsContent value="waiting">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="w-40 h-6" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="w-64 h-4" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md overflow-hidden">
                                <div className="gap-x-4 grid grid-cols-7 bg-muted/50 p-4">
                                    <Skeleton className="w-12 h-6" />
                                    <Skeleton className="w-32 h-6" />
                                    <Skeleton className="w-36 h-6" />
                                    <Skeleton className="w-20 h-6" />
                                    <Skeleton className="w-28 h-6" />
                                    <Skeleton className="w-28 h-6" />
                                    <Skeleton className="ml-auto w-24 h-6" />
                                </div>
                                {[...Array(5)].map((_, i) => (
                                    <div key={`row-${i}`} className="gap-x-4 grid grid-cols-7 p-4 border-t">
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
                                        <div className="flex justify-end space-x-2">
                                            <Skeleton className="rounded-md w-20 h-9" />
                                            <Skeleton className="rounded-md w-24 h-9" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
