'use server'

import { z } from 'zod';
import prisma from '@/app/lib/db';
import bcrypt from 'bcryptjs';

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
        await prisma.user.create({
            data: {
                email: email as string,
                name: name as string,
                password_hash: hashedPassword as string
            }
        }
        )
        console.log("here");
        return {
            message: 'User created successfully.',
        };
    }
    catch (error: any) {
        console.log("here2")
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return {
                message: 'Email is already in use.',
            };
        }
        return { message: `Database Error: falied to create user. ` }
    }


}