'use server'

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { users, tweet, userFollows, media } from '@/db/schema';
import { db } from '@/index';
import { and, eq, getTableColumns, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
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

export async function pullUsers() {
    const session = await auth();
    if (!session || !session.user) {
        return []
    }
    const followingRecords = await db.select({ b: userFollows.b }).from(userFollows).where(eq(userFollows.a, session.user.id as string));
    const followingList = followingRecords.map(record => record.b);
    const followingListCondition = followingList.length > 0
        ? sql`AND id NOT IN (${sql.join(followingList, sql`, `)})`
        : sql``;

    const results = await db.execute(sql`
  SELECT name, username, cover_image_url
  FROM users
  WHERE id != ${session.user.id}
  ${followingListCondition}
  ORDER BY RANDOM()
  LIMIT 20;
`);
    const user = await db.select().from(users).where(eq(users.id, session.user.id as string));
    let username: string | null = null;
    if ('username' in user) {
        username = user.username as string;
        revalidatePath(`/${username}`)
    }
    return results.rows
}

export async function followUser(username: string) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({
            result: "Failed",
            message: "Not logged in"
        });
    }
    const a = session.user.id;

    const second_user = await getUserByName(username);
    if (!second_user) {
        return NextResponse.json({
            result: "Failed",
            message: "User doesn't exist"
        });
    }
    const b = second_user.id;

    try {
        const followCheck = await db.select().from(userFollows).where(and(eq(userFollows.a, a as string), eq(userFollows.b, b as string)));
        console.log("Check successful:", followCheck);

        if (followCheck.length > 0) {
            const deleteResult = await db.delete(userFollows).where(and(eq(userFollows.a, a as string), eq(userFollows.b, b as string)));
            console.log("Delete successful:", deleteResult);
            return NextResponse.json({
                result: "Unfollowed",
                message: "Successfully unfollowed"
            });
        } else {
            const insertResult = await db.insert(userFollows).values({ a: a as string, b: b as string }).returning();
            console.log("Insert successful:", insertResult);
            return NextResponse.json({
                result: "Followed",
                message: "Successfully followed"
            });
        }
    } catch (error) {
        console.error("Operation failed:", error);
        return NextResponse.json({
            result: "Failed",
            message: "Operation failed"
        });
    }
    finally {
        revalidatePath(`/${second_user.username}`)
    }
}

export async function getUserProfile(username: string) {

    let user = null

    user = await db.execute(sql`
        SELECT 
            users.id, 
            users.name, 
            users.username, 
            users.created_at,
            users.cover_image_url, 
            (SELECT COUNT(*) FROM "_UserFollows" WHERE "A" = users.id) AS following,
            (SELECT COUNT(*) FROM "_UserFollows" WHERE "B" = users.id) AS followers
        FROM 
            users 
        WHERE 
            users.username = ${username}
    `);


    return user.rows;

}

export async function checkFollow(username: string) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({
            result: false,
            message: "Not logged in"
        });
    }
    const a = session.user.id;

    const second_user = await getUserByName(username);
    if (!second_user) {
        return NextResponse.json({
            result: false,
            message: "User doesn't exist"
        });
    }
    const b = second_user.id;

    try {
        const followCheck = await db.select().from(userFollows).where(and(eq(userFollows.a, a as string), eq(userFollows.b, b as string)));
        if (followCheck.length > 0) {
            return NextResponse.json({
                result: true,
            });
        } else {
            return NextResponse.json({
                result: false,
            });
        }
    }
    catch (error) {
        return NextResponse.json({
            message: "Couldn't get data."
        });
    }

}

export async function checkUsernameStatus(username: string) {
    const session = await auth();
    if (!session || !session.user) {
        return {
            result: false,
            message: "Not logged in",
            status: 401
        };
    }
    try {
        const result = await db.select({ username: users.username }).from(users).where(eq(users.username, username));
        if (result.length > 0) {
            return {
                result: false,
                message: "Username taken.",
                status: 409
            };
        }
        else {
            return {
                result: true,
                message: "Username available.",
                status: 200
            };
        }
    } catch (error) {
        return {
            result: false,
            message: "Check username operation failed",
            status: 500
        };
    }
}

export async function changeName(name: string) {
    const session = await auth();
    if (!session || !session.user) {
        return {
            message: "Not logged in",
            status: 401
        };
    }
    try {

        await db.update(users).set({ name: name }).where(eq(users.id, session.user.id as string));
        return {
            messsage: "username change successful",
            status: 200
        }
    }
    catch (error) {
        return {
            messsage: "Internal Server Error",
            status: 500
        }
    }
}

export async function changeProfilePicture(mediaUrl: string) {
    const session = await auth();
    if (!session || !session.user) {
        return {
            message: "Not logged in",
            status: 401
        };
    }

    mediaUrl = mediaUrl.split("?")[0]

    try {
        const mediaCheck = await db.select().from(media).where(eq(media.url, mediaUrl))
        if (mediaCheck.length < 0) {
            return {
                message: "Media not found",
                status: 404
            };
        }
        await db.update(media).set({ profilePicture: true }).where(eq(media.id, mediaCheck[0].id))
        const curProfilePic = await db.select({ coverImageUrl: users.coverImageUrl }).from(users).where(eq(users.id, session.user.id as string))
        if (curProfilePic.length > 0) {
            await db.delete(media).where(eq(media.url, curProfilePic[0].coverImageUrl as string))
        }
        await db.update(users).set({ coverImageUrl: mediaUrl }).where(eq(users.id, session.user.id as string))
        return {
            message: "Updated profile image",
            status: 200
        }
    }
    catch (error) {
        return {
            message: "Internal server error",
            status: 500
        }
    }
}

export async function getOwnProfile() {
    const session = await auth();
    if (!session || !session.user) {
        return {
            status: 401
        };
    }

    try {

        const { passwordHash, ...rest } = getTableColumns(users);
        const result = await db.select({ ...rest }).from(users).where(eq(users.id, session.user.id as string));

        return {
            user: result[0],
            status: 200
        }

    } catch (error) {
        return {
            status: 500
        }
    }


}