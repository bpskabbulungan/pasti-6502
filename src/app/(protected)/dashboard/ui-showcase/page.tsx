"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EnhancedThemeToggle } from "@/components/enhanced-theme-toggle";
import { ThemeColorsShowcase } from "@/components/enhanced-ui/theme-colors-showcase";
import { ThemeUsageExamples } from "@/components/enhanced-ui/theme-usage-examples";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import UIShowcaseSkeleton from "@/modules/dashboard/components/skeletons/UIShowcaseSkeleton";

export default function UIShowcasePage() {
    // Using empty destructure pattern as we only need the setter
    const [, setCurrentTheme] = useState("light");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Update theme detection on client-side
        const isDark = document.documentElement.classList.contains("dark");
        setCurrentTheme(isDark ? "dark" : "light");

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const isDark = document.documentElement.classList.contains("dark");
                    setCurrentTheme(isDark ? "dark" : "light");
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // Simulate loading delay
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    return (
        <>
            {isLoading ? (
                <UIShowcaseSkeleton />
            ) : (
                <div className="space-y-10 mx-auto px-4 py-8 container">
                    <header className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="font-bold text-[var(--text-primary)] text-2xl md:text-3xl">
                                UI Showcase
                            </h1>
                            <p className="mt-1 text-[var(--text-secondary)]">
                                Demonstrasi komponen UI dengan tema baru
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <EnhancedThemeToggle />
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] transition-colors"
                                >
                                    Kembali ke Dashboard
                                </Button>
                            </Link>
                        </div>
                    </header>

                    {/* Theme Colors Showcase */}
                    <section className="mb-12">
                        <ThemeColorsShowcase />
                    </section>

                    {/* Theme Usage Examples */}
                    <section className="mb-12">
                        <ThemeUsageExamples />
                    </section>

                    {/* UI Components */}
                    <section className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-[var(--card)] shadow-md border-[var(--border)]">
                            <CardHeader>
                                <CardTitle className="text-[var(--text-primary)]">Tombol-tombol</CardTitle>
                                <CardDescription className="text-[var(--text-secondary)]">
                                    Berbagai variasi tombol
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)]"
                                        onClick={() => toast.success("Tombol primary diklik!")}
                                    >
                                        Primary
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="bg-[var(--secondary)] hover:opacity-90 text-[var(--secondary-foreground)]"
                                    >
                                        Secondary
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="bg-[var(--destructive)] hover:opacity-90 text-[var(--destructive-foreground)]"
                                    >
                                        Destructive
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[var(--card)] shadow-md border-[var(--border)]">
                            <CardHeader>
                                <CardTitle className="text-[var(--text-primary)]">Form Elements</CardTitle>
                                <CardDescription className="text-[var(--text-secondary)]">
                                    Komponen untuk pengisian data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[var(--text-primary)]">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="nama@example.com"
                                        className="bg-[var(--background)] border-[var(--border)] text-[var(--text-primary)]"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms" className="border-[var(--border)] text-[var(--primary)]" />
                                    <Label
                                        htmlFor="terms"
                                        className="font-medium text-[var(--text-primary)] text-sm leading-none"
                                    >
                                        Saya setuju dengan syarat dan ketentuan
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[var(--card)] shadow-md border-[var(--border)]">
                            <CardHeader>
                                <CardTitle className="text-[var(--text-primary)]">Badges & UI Elements</CardTitle>
                                <CardDescription className="text-[var(--text-secondary)]">
                                    Elemen pendukung UI lainnya
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                                        Primary
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                                    >
                                        Secondary
                                    </Badge>
                                    <Badge
                                        variant="destructive"
                                        className="bg-[var(--destructive)] text-[var(--destructive-foreground)]"
                                    >
                                        Destructive
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <footer className="mt-16 pt-8 border-[var(--border)] border-t text-center">
                        <p className="text-[var(--text-secondary)] text-sm">
                            Sistem Antrean PST BPS Bulungan &copy; 2025
                        </p>
                    </footer>
                </div>
            )}
        </>
    );
}
