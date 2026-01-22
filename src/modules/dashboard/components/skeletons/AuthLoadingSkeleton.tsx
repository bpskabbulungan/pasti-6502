"use client";

import { Loader2 } from "lucide-react";

export default function AuthLoadingSkeleton() {
    return (
        <div className="flex flex-col justify-center items-center min-h-[400px]">
            <Loader2 className="mb-4 w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground text-center">
                Memuat informasi pengguna...
            </p>
        </div>
    );
}
