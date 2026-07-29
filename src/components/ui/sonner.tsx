"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="group toaster"
      position="top-right"
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--surface)",
          "--success-text": "var(--text-primary)",
          "--success-border": "var(--border)",
          "--error-bg": "var(--surface)",
          "--error-text": "var(--text-primary)",
          "--error-border": "var(--border)",
          "--toast-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group rounded-xl border border-border bg-card p-4 font-sans text-sm shadow-[var(--shadow-soft)]",
          title: "text-primary-color font-semibold",
          description: "text-secondary-color text-sm mt-1",
          actionButton: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
          cancelButton: "bg-[var(--muted)] text-[var(--text-secondary)]",
          closeButton: "text-[var(--text-secondary)] opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
          success: "border-l-4 border-l-[var(--secondary)]",
          error: "border-l-4 border-l-[var(--destructive)]",
          info: "border-l-4 border-l-[var(--primary)]",
          warning: "border-l-4 border-l-[var(--secondary)]",
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
