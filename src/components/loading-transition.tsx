"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LoadingTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        // Non-blocking indicator for route changes only.
        setShowIndicator(true);
        const timer = setTimeout(() => {
            setShowIndicator(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            {children}
            {showIndicator ? (
                <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-primary/80 animate-pulse" />
            ) : null}
        </>
    );
}
