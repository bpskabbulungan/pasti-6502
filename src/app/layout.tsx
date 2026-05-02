import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import "@/styles/theme-tokens.css";
import AuthProvider from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import LoadingTransition from "@/components/shared/loading-transition";
import { Suspense } from "react";
import SiteFooter from "@/components/shared/site-footer";
import AppLoadingScreen from "@/components/shared/app-loading-screen";
import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import { authOptions } from "@/lib/auth";

const poppins = Poppins({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const appUrl =
  process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const appIconPng = "/icon_pst.png";
const appIconIco = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  icons: {
    icon: appIconIco,
    apple: appIconPng,
    shortcut: appIconIco,
  },
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} - ${APP_TAGLINE}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href={appIconIco} />
        <link rel="icon" type="image/png" href={appIconPng} />
        <link rel="apple-touch-icon" href={appIconPng} />
        <link rel="shortcut icon" href={appIconIco} />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider session={session}>
            <Suspense fallback={<AppLoadingScreen />}>
              <LoadingTransition>
                <div className="flex min-h-screen flex-col">
                  <div className="flex-1 min-h-0">{children}</div>
                  <SiteFooter />
                </div>
              </LoadingTransition>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

