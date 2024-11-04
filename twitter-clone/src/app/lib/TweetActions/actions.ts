"use server"

import { auth } from "@/auth"
import { desc, getTableColumns, inArray, InferSelectModel, lt } from "drizzle-orm"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { media, tweet, users } from "@/db/schema"
import { db } from "@/index"
import { eq, sql } from "drizzle-orm"
import crypto from "crypto";
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})
const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm"
]

const maxFileSize = 1024 * 1024 * 10;

export async function getSignedURL(type: string, size: number, checksum: string) {
    const session = await auth();
    if (!session || !session.user) {
        return { failure: "not authenticated." }
    }

    if (!acceptedTypes.includes(type)) {
        return ({ failure: "Invalid file type" })
    }

    if (size > maxFileSize) {
        return ({ failure: "File too large" })
    }

    const PutObjctCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: generateFileName(),
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checksum,
        Metadata: {
            userId: session.user?.id || ""
        }
    })

    const signedURL = await getSignedUrl(s3, PutObjctCommand, {
        expiresIn: 60
    })


    const result = await db.insert(media).values({
        url: signedURL.split("?")[0],
        type: type,
        userId: session.user.id,
    }).returning()
    const mediaResult = result[0]

    return { success: { url: signedURL, mediaId: mediaResult.id } }
}

type MediaRes = InferSelectModel<typeof media>
type Tweet = InferSelectModel<typeof tweet>
export async function createTweet({ content, mediaIds }: { content: string, mediaIds?: string[] }) {

    const session = await auth();
    if (!session || !session.user) {
        return { failure: "No user." }
    }

    let post: Tweet | null = null;

    try {
        if (mediaIds && mediaIds.length > 0) {
            let foundMedia: MediaRes[] = [];
            foundMedia = await db.select().from(media).where(inArray(media.id, mediaIds))
            if (foundMedia.length !== mediaIds.length) {
                return { failure: "Some media entries are missing or do not belong to the user." };
            }

            const result = await db.insert(tweet).values({
                userId: session.user.id as string,
                content: content,

            }).returning();
            post = result[0]
            if (post) {
                await db.update(media).set({ tweetId: post!.id }).where(inArray(media.id, mediaIds));
            } else {
                return { failure: "Some media entries failed to attach to tweet" }; // Handle potential error
            }

        }
        else {
            const result = await db.insert(tweet).values({
                userId: session.user.id as string,
                content: content,

            }).returning();
            post = result[0]
        }

    }
    catch (error) {
        return { failure: "An error occurred while creating the tweet." };
    }
    finally {
        if (post) {
            console.log(post)
            revalidatePath("/Home")
            redirect("/Home")
        }
    }


}

export async function pullTweets(timestamp: string) {
    const results = await db.execute(sql`
        SELECT "Tweet".id, 
               "Tweet".content, 
               "Tweet".parent_tweet_id, 
               "Tweet".tweet_type, 
               "Tweet"."createdAt", 
           STRING_AGG(CONCAT(media.id, ':', media.url, ':', media.type), ',') AS media_info,
               users.name, 
               users.cover_image_url, 
               users.username
        FROM "Tweet" 
        INNER JOIN users ON "Tweet".user_id = users.id 
        LEFT JOIN media ON media."tweetId" = "Tweet".id 
        WHERE "Tweet"."createdAt" < ${timestamp}
        GROUP BY "Tweet".id, 
             "Tweet".content, 
             "Tweet".parent_tweet_id, 
             "Tweet".tweet_type, 
             "Tweet"."createdAt", 
             users.name, 
             users.cover_image_url, 
             users.username
        ORDER BY "Tweet"."createdAt" DESC
        LIMIT 20
    `);

    return results

}
