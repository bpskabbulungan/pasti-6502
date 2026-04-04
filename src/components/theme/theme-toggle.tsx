"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const titleText = mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={titleText}
            className="relative h-10 w-10 rounded-xl border-border/80 bg-background/80 shadow-sm hover:bg-muted/70"
            aria-label="Toggle theme"
        >
            <Sun className="absolute h-4 w-4 rotate-0 scale-100 text-primary transition-all duration-200 dark:rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-primary transition-all duration-200 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
            {mounted && (
                <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
            )}
        </Button>
    )
}

