"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedThemeToggle } from "@/components/theme/enhanced-theme-toggle";
import { toast } from "sonner";

export function ThemeColorsShowcase() {
    const [currentTheme, setCurrentTheme] = useState("light");

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

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <Card className="bg-[var(--card)] shadow-md border-[var(--border)] overflow-hidden">
            <CardHeader className="border-[var(--border)] border-b">
                <CardTitle className="text-[var(--text-primary)]">Tema dan Pallete Warna</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                    Tema saat ini: <strong className="text-[var(--primary)]">{currentTheme === "dark" ? "Gelap" : "Terang"}</strong> -
                    Variabel warna yang digunakan dalam aplikasi
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="gap-8 grid grid-cols-1 md:grid-cols-2">
                    {/* Theme Toggle Demo */}
                    <div className="flex flex-col gap-4">
                        <h3 className="mb-2 font-medium text-[var(--text-primary)] text-lg">Pengalihan Tema</h3>

                        <div className="flex justify-center items-center bg-[var(--background)] p-6 border border-[var(--border)] rounded-lg">
                            <div className="flex flex-col items-center gap-4">
                                <EnhancedThemeToggle />

                                <div className="mt-2 text-[var(--text-secondary)] text-sm text-center">
                                    Klik untuk beralih antara tema terang dan gelap
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--background)] p-4 border border-[var(--border)] rounded-lg">
                            <h4 className="mb-2 font-medium text-[var(--text-primary)]">Implementasi CSS</h4>
                            <div className="relative bg-[var(--surface)] p-4 border border-[var(--border)] rounded-md overflow-hidden">
                                <pre className="overflow-x-auto text-[var(--text-primary)] text-xs">
                                    <code>{`:root {
  --primary: #F79039;
  --primary-hover: #e67620;
  --secondary: #FEB856;
  --accent: #9A0501;
  --background: #FFE5D3;
  --surface: #FFF4EC;
  --text-primary: #2D2D2D;
  --text-secondary: #5C5C5C;
  --border: #E0D4C8;
}

.dark {
  --primary: #F79039;
  --primary-hover: #FF9F3C;
  --secondary: #FEB856;
  --accent: #FF6A5E;
  --background: #1A1A1A;
  --surface: #2A2A2A;
  --text-primary: #FFFFFF;
  --text-secondary: #CCCCCC;
  --border: #3A3A3A;
}`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Colors Grid */}
                    <div>
                        <h3 className="mb-4 font-medium text-[var(--text-primary)] text-lg">Palette Warna</h3>
                        <div className="gap-4 grid grid-cols-2 sm:grid-cols-3">
                            {[
                                { name: "Primary", color: "var(--primary)", textColor: "var(--primary-foreground)" },
                                { name: "Primary Hover", color: "var(--primary-hover)", textColor: "var(--primary-foreground)" },
                                { name: "Secondary", color: "var(--secondary)", textColor: "var(--secondary-foreground)" },
                                { name: "Accent", color: "var(--accent)", textColor: "var(--accent-foreground)" },
                                { name: "Background", color: "var(--background)", textColor: "var(--text-primary)" },
                                { name: "Surface", color: "var(--surface)", textColor: "var(--text-primary)" }
                            ].map((color) => (
                                <div key={color.name} className="flex flex-col gap-1">
                                    <div
                                        className="flex justify-center items-center shadow-sm border border-[var(--border)] rounded-lg h-20"
                                        style={{ backgroundColor: color.color, color: color.textColor }}
                                    >
                                        <span className="font-medium text-xs">
                                            {color.name}
                                        </span>
                                    </div>
                                    <div className="text-[var(--text-secondary)] text-xs">
                                        {color.color}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="mt-6 mb-4 font-medium text-[var(--text-primary)] text-lg">Text & Border</h3>
                        <div className="gap-4 grid grid-cols-2 sm:grid-cols-3">
                            {[
                                { name: "Text Primary", color: "var(--text-primary)", bgColor: "var(--surface)" },
                                { name: "Text Secondary", color: "var(--text-secondary)", bgColor: "var(--surface)" },
                                { name: "Border", color: "var(--border)", bgColor: "var(--surface)" }
                            ].map((color) => (
                                <div key={color.name} className="flex flex-col gap-1">
                                    <div
                                        className="flex justify-center items-center shadow-sm p-2 border border-[var(--border)] rounded-lg h-20 text-center"
                                        style={{
                                            backgroundColor: color.bgColor,
                                            color: color.color,
                                            ...(color.name === "Border" && {
                                                borderColor: color.color,
                                                borderWidth: '4px'
                                            })
                                        }}
                                    >
                                        <span className="font-medium text-xs">
                                            {color.name === "Border" ? "Border Color" : "Sample Text"}
                                        </span>
                                    </div>
                                    <div className="text-[var(--text-secondary)] text-xs">
                                        {color.color}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-[var(--background)] border-[var(--border)] border-t">
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-[var(--text-secondary)] text-xs">
                        Semua warna di atas tersedia sebagai CSS variables dan dapat digunakan dengan format <code>var(--color-name)</code>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Button size="sm" className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)]">
                            Primary Button
                        </Button>
                        <Button size="sm" variant="outline" className="border-[var(--border)] text-[var(--text-primary)]">
                            Outline Button
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                toast.success("Berhasil mengubah tema!", {
                                    description: "Tema aplikasi telah berhasil diperbarui."
                                });
                            }}
                            className="bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                        >
                            Toast Demo
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

