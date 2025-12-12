"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UIShowcaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[var(--background)] min-h-screen">
            <div className="mx-auto p-4 container">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center mb-4 text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                    <ArrowLeft className="mr-1 w-4 h-4" />
                    <span>Kembali ke Dashboard</span>
                </Link>
                {children}
            </div>
        </div>
    );
}
