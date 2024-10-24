import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import prisma from "@/app/lib/db";
import { z } from 'zod';
import type { Provider } from "next-auth/providers"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { encode as defaultEncode } from "next-auth/jwt";
import { v4 as uuid } from "uuid";

const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    oAuthProvider: z.enum(["GOOGLE", "APPLE"]).optional(),
    oAuthId: z.string().optional(),
    password: z.string(),
})

const LoginUserSS = UserSchema.omit({ id: true, oAuthProvider: true, oAuthId: true, name: true })

const providers: Provider[] = [Google,
    Credentials({
        credentials: {
            email: {},
            password: {},
        },
        authorize: async (credentials) => {
            const validatedFields = LoginUserSS.safeParse({
                email: credentials.email,
                password: credentials.password,
            });

            if (!validatedFields.success) {
                throw new Error("Invalid email or password.")
            }


            let user = null

            user = await prisma.user.findUnique({
                where: {
                    email: credentials.email as string
                }
            })

            if (!user) {
                throw new Error("User not found.")
            }

            const match = await bcrypt.compare(credentials.password as string, user.password_hash as string);

            if (!match) {
                throw new Error("Incorrect password.")
            }

            return user
        }
    }),
]


export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })
    .filter((provider) => provider.id !== "credentials")

const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: adapter,
    providers: providers,
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (account?.provider === "credentials") {
                token.credentials = true
            }
            return token
        },
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth
        },
    },
    jwt: {
        encode: async function (params) {
            if (params.token?.credentials) {
                const sessionToken = uuid()

                if (!params.token.sub) {
                    throw new Error("No user ID found in token")
                }

                const createdSession = await adapter?.createSession?.({
                    sessionToken: sessionToken,
                    userId: params.token.sub,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                })

                if (!createdSession) {
                    throw new Error("Failed to create session")
                }

                return sessionToken
            }
            return defaultEncode(params)
        }
    }
}
)
