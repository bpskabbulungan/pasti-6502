"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, SunMoon } from "lucide-react"
import { useEffect, useState } from "react"

export function EnhancedThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // This avoids hydration mismatch - the title is only set client-side after mounting
    const titleText = mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-xl border-border/80 bg-background/80 shadow-sm"
                aria-label="Loading theme toggle"
                disabled
            >
                <SunMoon className="h-4 w-4 animate-pulse text-muted-foreground" />
            </Button>
        )
    } return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={titleText}
            className="relative h-10 w-10 overflow-hidden rounded-xl border-border/80 bg-background/80 shadow-sm hover:bg-muted/70"
            aria-label="Toggle theme"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 dark:opacity-100"></div>

            <Sun className="absolute h-4 w-4 rotate-0 scale-100 text-primary transition-all duration-200 dark:rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-primary transition-all duration-200 dark:rotate-0 dark:scale-100" />

            <span className="sr-only">Toggle theme</span>
            {mounted && (
                <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
            )}
        </Button>
    )
}
