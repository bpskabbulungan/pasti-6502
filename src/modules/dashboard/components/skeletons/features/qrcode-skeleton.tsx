"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function QRCodeSkeleton() {
    return (
        <div className="mx-auto p-4 md:p-8 container">
            {/* Header Title */}
            <div className="mb-6 text-center">
                <Skeleton className="mx-auto w-3/4 h-8" />
            </div>

            <div className="flex flex-col items-center space-y-6">
                {/* QR Code Image Placeholder */}
                <div className="bg-muted p-2 border-4 border-border rounded-lg">
                    <Skeleton className="w-[300px] h-[300px]" />
                </div>

                {/* Download Button */}
                <Skeleton className="w-[200px] h-10" />
            </div>

            {/* Info Card */}
            <div className="mt-8 p-6 border rounded-lg">
                <Skeleton className="mb-3 w-48 h-6" />
                <Skeleton className="mb-4 w-full h-4" />

                <div className="p-4 border rounded-md">
                    <Skeleton className="mb-2 w-40 h-5" />
                    <div className="space-y-2 ml-2">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
