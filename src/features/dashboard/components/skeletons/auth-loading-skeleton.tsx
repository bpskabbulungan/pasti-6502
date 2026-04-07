"use client";

import AppLoader from "@/components/shared/app-loader";

export default function AuthLoadingSkeleton() {
    return (
        <div className="flex flex-col justify-center items-center min-h-[400px]">
            <AppLoader size="lg" className="mb-4 text-primary" />
            <p className="text-muted-foreground text-center">
                Memuat informasi pengguna...
            </p>
        </div>
    );
}
