"use client";

import { useEffect, useState } from "react";

/**
 * A component that renders time only on the client side.
 * This avoids hydration mismatches between server and client rendering.
 */
export function ClientOnlyCurrentTime({
    className = "",
    fallback = "-",
    format = "time", // "time" or "datetime"
    locale = "id-ID",
    timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }
}: {
    className?: string;
    fallback?: string;
    format?: "time" | "datetime";
    locale?: string;
    timeOptions?: Intl.DateTimeFormatOptions;
}) {
    const [time, setTime] = useState<string>(fallback);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        function updateTime() {
            const now = new Date();

            if (format === "time") {
                setTime(now.toLocaleTimeString(locale, timeOptions));
            } else {
                setTime(now.toLocaleString(locale, timeOptions));
            }
        }

        // Set initial time
        updateTime();

        // Update time every second
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, [format, locale, timeOptions]);


    // Critical: Don't render anything meaningful during SSR
    if (!mounted) {
        return <span className={className}>{fallback}</span>;
    }

    return <span className={className}>{time}</span>;
}
