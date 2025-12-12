import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import "@/styles/theme-tokens.css";
import AuthProvider from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import LoadingTransition from "@/components/loading-transition";
import { Suspense } from 'react';

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  icons: {
    icon: "/icon_pst.png",
    shortcut: "/icon_pst.png",
    apple: "/icon_pst.png",
  },
  title: "PST BPS Bulungan - Sistem Antrean",
  description: "Sistem Antrean Pelayanan Statistik Terpadu BPS Kabupaten Bulungan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/icon_pst.png" />
        <link rel="apple-touch-icon" href="/icon_pst.png" />
        <link rel="shortcut icon" href="/icon_pst.png" />
      </head>
      <body className={`${lato.variable} font-lato antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Suspense fallback={null}>
              <LoadingTransition>
                {children}
              </LoadingTransition>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
