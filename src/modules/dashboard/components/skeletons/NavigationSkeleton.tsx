"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function NavigationSkeleton() {
    return (
        <div className="space-y-2">
            {/* Generate 7 skeleton items to match the navigation menu */}
            {[...Array(7)].map((_, i) => (
                <div key={`nav-skeleton-${i}`} className="flex items-center space-x-2 px-4 py-2 rounded-md">
                    <Skeleton className="rounded w-5 h-5" />
                    <Skeleton className="w-24 h-5" />
                </div>
            ))}
        </div>
    );
}
