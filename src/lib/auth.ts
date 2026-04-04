import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  clearFailedLoginAttempts,
  getAuthRequestIp,
  getFailedLoginAttemptStatus,
  registerFailedLoginAttempt,
} from "@/lib/auth-login-attempts";
import { logWarn } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { loginCredentialsSchema } from "@/lib/validation/login-credentials";

const DUMMY_BCRYPT_HASH = "$2a$12$WzE8Ys1YB1s5nM3rWEO0mOnfy4VBfWbfX3HBOH4Zz2oxEd4pqco3e";

const logRateLimitEvent = (
  reason: "pre-check" | "failed-password",
  ip: string,
  username: string,
  resetAt: number
) => {
  logWarn("Login attempt throttled", {
    reason,
    ip,
    username,
    resetAt: new Date(resetAt).toISOString(),
  });
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, req) {
        const parsed = loginCredentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;
        const ip = getAuthRequestIp(req?.headers);
        const blockedStatus = await getFailedLoginAttemptStatus(ip, username);
        if (blockedStatus.blocked) {
          logRateLimitEvent("pre-check", ip, username, blockedStatus.resetAt);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            username,
          },
          select: {
            id: true,
            name: true,
            username: true,
            password: true,
            role: true,
          },
        });

        if (!user) {
          // Keep timing closer to existing-user flow to reduce username probing signal.
          await compare(password, DUMMY_BCRYPT_HASH);
          const failedStatus = await registerFailedLoginAttempt(ip, username);
          if (failedStatus.blocked) {
            logRateLimitEvent("failed-password", ip, username, failedStatus.resetAt);
          }
          return null;
        }

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
          const failedStatus = await registerFailedLoginAttempt(ip, username);
          if (failedStatus.blocked) {
            logRateLimitEvent("failed-password", ip, username, failedStatus.resetAt);
          }
          return null;
        }

        await clearFailedLoginAttempts(ip, username);

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
