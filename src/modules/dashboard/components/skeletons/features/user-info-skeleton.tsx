"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function UserInfoSkeleton() {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <Skeleton className="mb-1 w-24 h-5" />
                    <Skeleton className="w-16 h-4" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="rounded-full w-8 h-8" />
                    <Skeleton className="rounded-full w-8 h-8" />
                </div>
            </div>
            <Button
                variant="outline"
                className="flex items-center space-x-2 w-full"
                disabled
            >
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-16 h-4" />
            </Button>
        </div>
    );
}
