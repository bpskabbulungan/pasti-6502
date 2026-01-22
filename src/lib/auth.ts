import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: {
						username: credentials.username,
					},
				});

				if (!user) {
					return null;
				}

				const passwordMatch = await compare(
					credentials.password,
					user.password
				);

				if (!passwordMatch) {
					return null;
				}

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
		signIn: "/",
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
		maxAge: 24 * 60 * 60, // 1 day - session expires at midnight every day
	},
	secret: process.env.NEXTAUTH_SECRET,
};
