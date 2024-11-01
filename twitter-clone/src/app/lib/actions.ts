'use server'

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { users, tweet } from '@/db/schema';
import { db } from '@/index';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
const UserSchema = z.object({
    id: z.string(),
    email: z.string().email("Please enter a valid email."),
    name: z.string().min(1, "Whats your name?"),
    oAuthProvider: z.enum(["GOOGLE", "APPLE"]),
    oAuthId: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters.").max(64, "Password must be less than 64 characters."),
})

const CreateUserSS = UserSchema.omit({ id: true, oAuthProvider: true, oAuthId: true })
const LoginUserSS = UserSchema.omit({ id: true, oAuthProvider: true, oAuthId: true, name: true })
const CreateUserOA = UserSchema.omit({ id: true, password: true })

export type CreateUserState = {
    errors?: {
        email?: string[];
        name?: string[];
        password?: string[];
    };
    message?: string | null;
};

const UsernameSchema = z.object({
    username: z.string().min(1, "It needs to be at least 1 character long.").max(30, "It has to be less than 30 characters long.")
})

export type CreateUsernameState = {
    errors?: {
        username?: string[];
    };
    message?: string | null;
}

export async function createUserEP(prevState: CreateUserState, formData: FormData) {

    const validatedFields = CreateUserSS.safeParse({
        email: formData.get('email'),
        name: formData.get('name'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        console.log("here3");
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create user.',
        };
    }

    const { email, name, password } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {

        await db.insert(users).values({
            email: email as string,
            name: name as string,
            passwordHash: hashedPassword as string
        })
        console.log("here");
        return {
            message: 'User created successfully.',
        };
    }
    catch (error: any) {
        return { message: 'Database Error: falied to create user' }
    }


}

export async function changeUserName(prevState: CreateUsernameState, formData: FormData) {

    const session = await auth();
    if (!session || !session.user) {
        return {
            message: 'Not logged in.',
        };
    }
    const user = session.user;
    const validatedFields = UsernameSchema.safeParse({
        username: formData.get("username")
    });

    if (!validatedFields.success) {
        console.log("here3");
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create user.',
        };
    }

    const { username } = validatedFields.data;

    try {
        if (user.id) {
            await db.update(users).set({ username: username as string }).where(eq(users.id, user.id));
        }
        else {
            throw new Error("User ID is undefined.");
        }
        console.log("here");
        revalidatePath("/Home")
        return {
            message: 'Username accepted.',
        };
    }
    catch (error: any) {
        console.log("here2")
        return { message: 'Database Error: falied to change username' }
    }


}

export async function getUserByName(name: string) {
    let user = null

    user = await db.select().from(users).where(eq(users.username, name));

    return user[0]
}

export async function getUserById(id: string) {
    let user = null

    user = await db.select().from(users).where(eq(users.id, id));

    return user[0]
}

export async function getUserPostAmount(username: string) {
    const tweetCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(tweet)
        .innerJoin(users, eq(users.id, tweet.userId))
        .where(eq(users.username, username));

    return tweetCount[0].count;
}
