"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export interface AuthProviderProps {
    children: ReactNode;
    session?: Session | null;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
    return (
        <SessionProvider session={session} basePath="/api/auth">
            {children}
        </SessionProvider>
    );
}
