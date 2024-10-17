import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import prisma from "@/app/lib/db";
import { z } from 'zod';
import type { Provider } from "next-auth/providers"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: providers,
    pages: {
        signIn: "/login"
    }
}
)


