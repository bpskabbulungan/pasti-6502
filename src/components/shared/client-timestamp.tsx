"use client";

import { useEffect, useState } from "react";

type ClientTimestampProps = {
    timestamp?: Date | string | null;
    format?: "time" | "datetime" | "relative";
    className?: string;
    prefix?: string;
    suffix?: string;
    fallback?: string;
    locale?: string;
    options?: Intl.DateTimeFormatOptions;
};

export function ClientTimestamp({
    timestamp,
    format = "time",
    className = "",
    prefix = "",
    suffix = "",
    fallback = "-",
    locale = "id-ID",
    options,
}: ClientTimestampProps) {
    const [mounted, setMounted] = useState(false);
    const [formattedTime, setFormattedTime] = useState<string>("");

    useEffect(() => {
        setMounted(true);

        const updateFormattedTime = () => {
            if (!timestamp) {
                setFormattedTime(fallback);
                return;
            }

            try {
                const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

                if (format === "time") {
                    const defaultOptions: Intl.DateTimeFormatOptions = options || {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    };
                    setFormattedTime(date.toLocaleTimeString(locale, defaultOptions));
                } else if (format === "datetime") {
                    const defaultOptions: Intl.DateTimeFormatOptions = options || {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    };
                    setFormattedTime(date.toLocaleString(locale, defaultOptions));
                }
            } catch (error) {
                console.error("Error formatting date:", error);
                setFormattedTime(fallback);
            }
        };

        updateFormattedTime();
    }, [timestamp, format, fallback, locale, options]);
    // Server-side or initial client render
    if (!mounted) {
        // Return a skeleton or placeholder that matches expected client render exactly
        return <span className={className}>-</span>;
    }

    // Client-side render
    return (
        <span className={className}>
            {prefix}
            {formattedTime}
            {suffix}
        </span>
    );
}

export function ClientCurrentTime({
    format = "time",
    className = "",
    prefix = "",
    suffix = "",
    locale = "id-ID",
    options,
    refreshInterval = 1000,
}: Omit<ClientTimestampProps, "timestamp" | "fallback"> & { refreshInterval?: number }) {
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        setMounted(true);

        // Update time immediately
        setCurrentTime(new Date());

        // Set up interval to update time
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval]);

    if (!mounted) {
        return <span className={className}>-</span>;
    }

    const formattedTime = format === "time"
        ? currentTime.toLocaleTimeString(locale, options || {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
        : currentTime.toLocaleString(locale, options);

    return (
        <span className={className}>
            {prefix}
            {formattedTime}
            {suffix}
        </span>
    );
}
