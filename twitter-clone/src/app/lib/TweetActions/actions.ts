"use server"

import { auth } from "@/auth"
import { and, inArray, InferSelectModel, } from "drizzle-orm"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { likes, media, tweet, retweets, users } from "@/db/schema"
import { db } from "@/index"
import { eq, sql } from "drizzle-orm"
import crypto from "crypto";
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
            revalidatePath("/Home")
        }
    }


}

type User = InferSelectModel<typeof users>

export async function createReply({ parentId, content, mediaIds }: { parentId: string, content: string, mediaIds?: string[] }) {

    const session = await auth();
    if (!session || !session.user) {
        return { failure: "No user." }
    }

    let post: Tweet | null = null;
    let parentUser: any[] | null = null;
    try {
        const parentTweet = db.select().from(tweet).where(eq(tweet.id, parentId)).as('sq')
        parentUser = await db.select().from(users).leftJoin(parentTweet, eq(users.id, parentTweet.id))

        if (!parentUser || parentUser.length == 0) {
            return { failure: "Parent id missing" };

        }
        if (mediaIds && mediaIds.length > 0) {
            let foundMedia: MediaRes[] = [];
            foundMedia = await db.select().from(media).where(inArray(media.id, mediaIds))
            if (foundMedia.length !== mediaIds.length) {
                return { failure: "Some media entries are missing or do not belong to the user." };
            }

            const result = await db.insert(tweet).values({
                userId: session.user.id as string,
                parentTweetId: parentId,
                content: content,
                tweetType: "REPLY"

            }).returning();
            post = result[0]
            if (post) {
                await db.update(media).set({ tweetId: post!.id }).where(inArray(media.id, mediaIds));
            } else {
                return { failure: "Some media entries failed to attach to reply" }; // Handle potential error
            }

        }
        else {
            await db.insert(tweet).values({
                userId: session.user.id as string,
                content: content,
                parentTweetId: parentId,
                tweetType: "REPLY"

            });
        }

    }
    catch (error) {
        console.log(error)
        return { failure: "An error occurred while creating the reply." };
    }
    finally {
        if (parentUser) {
            revalidatePath(`/${parentUser[0].username}/tweet/${parentId}`)
        }
        return { success: "Reply created" }
    }


}

export async function pullTweets(timestamp: string, userId: string = "0") {

    const results = await db.execute(sql`SELECT 
    t.id,
    t.content,
    t."createdAt",
    t.tweet_type, 
    t.parent_tweet_id,
    users.id AS user_id,
    users.username,
    users.name,
    users.cover_image_url,
    STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
    (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id) AS likes,
    EXISTS (SELECT 1 FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${userId}) AS liked,
    (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) AS retweets,
    EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${userId}) AS retweeted,
    NULL::text AS retweeter_username,
    t."createdAt" AS retweet_createdAt,
    (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM "Tweet" AS t
LEFT JOIN media ON media."tweetId" = t.id
JOIN users ON t.user_id = users.id
WHERE t."createdAt" < ${timestamp} AND t.tweet_type != 'REPLY'
GROUP BY 
    t.id,
    t.content,
    t."createdAt",
    t.tweet_type,
    t.parent_tweet_id,
    users.id,
    users.username,
    users.name,
    users.cover_image_url

UNION ALL

SELECT 
    t.id,
    t.content,
    t."createdAt",
    t.tweet_type, 
    t.parent_tweet_id,
    original_users.id AS user_id,
    original_users.username,
    original_users.name,
    original_users.cover_image_url,
    STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
    (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id) AS likes,
    EXISTS (SELECT 1 FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${userId}) AS liked,
    (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) AS retweets,
    EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${userId}) AS retweeted,
    retweeter.username AS retweeter_username,
    retweets.created_at AS retweet_createdAt,
    (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM retweets
JOIN "Tweet" AS t ON retweets.parent_tweet_id = t.id
LEFT JOIN media ON media."tweetId" = t.id
JOIN users AS original_users ON t.user_id = original_users.id
JOIN users AS retweeter ON retweets.user_id = retweeter.id
WHERE retweets.created_at < ${timestamp} AND t.tweet_type != 'REPLY'
GROUP BY 
    t.id,
    t.content,
    t."createdAt",
    t.tweet_type,
    t.parent_tweet_id,
    original_users.id,
    original_users.username,
    original_users.name,
    original_users.cover_image_url,
    retweeter.username,
    retweets.created_at

ORDER BY retweet_createdAt DESC
LIMIT 20;
    `);

    return results

}

export async function pullTweetsFromUser(username: string, offset?: string | null, userId: string = "0") {


    const results = await db.execute(sql`SELECT t.id, 
       t.content, 
       t.parent_tweet_id, 
       t.tweet_type, 
       t."createdAt", 
       STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
       users.name, 
       users.cover_image_url, 
       users.username,
       (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id ) as likes,
       EXISTS (SELECT * FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${userId}) AS liked,
       (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) as retweets,
       EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${userId}) AS retweeted,
       NULL::text as retweeter_username,
       t."createdAt" AS retweet_createdAt,
       (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM "Tweet" AS t
INNER JOIN users ON t.user_id = users.id 
LEFT JOIN media ON media."tweetId" = t.id 
WHERE t.user_id = (SELECT users.id FROM users WHERE users.username = ${username}) AND t.tweet_type != 'REPLY'
GROUP BY t.id, 
         t.content, 
         t.parent_tweet_id, 
         t.tweet_type, 
         t."createdAt", 
         users.name, 
         users.cover_image_url, 
         users.username
                
UNION ALL

SELECT t.id, 
       t.content, 
       t.parent_tweet_id, 
       t.tweet_type, 
       t."createdAt", 
       STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
       users.name, 
       users.cover_image_url, 
       users.username,
       (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id ) as likes,
       EXISTS (SELECT * FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${userId}) AS liked,
       (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) as retweets,
       EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${userId}) AS retweeted,
       retweeter.username as retweeter_username,
       retweets.created_at AS retweet_createdAt,
       (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM retweets
JOIN "Tweet" AS t ON t.id = retweets.parent_tweet_id
JOIN users ON t.user_id = users.id
JOIN users AS retweeter ON retweets.user_id = users.id
LEFT JOIN media ON media."tweetId" = t.id 
WHERE t.user_id = (SELECT users.id FROM users WHERE users.username = ${username}) AND t.tweet_type != 'REPLY'
GROUP BY t.id, 
         t.content, 
         t.parent_tweet_id, 
         t.tweet_type, 
         t."createdAt", 
         users.name, 
         users.cover_image_url, 
         users.username,
         retweeter.username,
         retweets.created_at
ORDER BY retweet_createdAt DESC
OFFSET ${typeof offset == "string" ? parseInt(offset) : 0}
LIMIT 20;
    `);

    return results

}



export async function pullTweetsFromFollowing(id: string, offset?: string | null) {

    const results = await db.execute(sql`SELECT t.id, 
       t.content, 
       t.parent_tweet_id, 
       t.tweet_type, 
       t."createdAt", 
       STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
       users.name, 
       users.cover_image_url, 
       users.username,
       (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id ) as likes,
       EXISTS (SELECT * FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${id}) AS liked,
       (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) as retweets,
       EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${id}) AS retweeted,
       NULL::text as retweeter_username,
       t."createdAt" AS retweet_createdAt,
       (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM "Tweet" AS t
INNER JOIN users ON t.user_id = users.id 
LEFT JOIN media ON media."tweetId" = t.id 
WHERE t.user_id IN (SELECT "_UserFollows"."B" FROM "_UserFollows" WHERE "_UserFollows"."A" = ${id}) AND t.tweet_type != 'REPLY'
GROUP BY t.id, 
         t.content, 
         t.parent_tweet_id, 
         t.tweet_type, 
         t."createdAt", 
         users.name, 
         users.cover_image_url, 
         users.username

UNION ALL

SELECT t.id, 
       t.content, 
       t.parent_tweet_id, 
       t.tweet_type, 
       t."createdAt", 
       STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
       users.name, 
       users.cover_image_url, 
       users.username,
       (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id ) as likes,
       EXISTS (SELECT * FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${id}) AS liked,
       (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) as retweets,
       EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${id}) AS retweeted,
       retweeter.username as retweeter_username,
       retweets.created_at AS retweet_createdAt,
       (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM retweets
JOIN "Tweet" AS t ON retweets.parent_tweet_id = t.id
JOIN users ON t.user_id = users.id 
JOIN users AS retweeter ON retweets.user_id = retweeter.id
LEFT JOIN media ON media."tweetId" = t.id 
WHERE t.user_id IN (SELECT "_UserFollows"."B" FROM "_UserFollows" WHERE "_UserFollows"."A" = ${id}) AND t.tweet_type != 'REPLY'
GROUP BY t.id, 
         t.content, 
         t.parent_tweet_id, 
         t.tweet_type, 
         t."createdAt", 
         users.name, 
         users.cover_image_url, 
         users.username,
         retweeter.username,
         retweets.created_at

ORDER BY retweet_createdAt DESC
OFFSET ${typeof offset == "string" ? parseInt(offset) : 0}
LIMIT 20;
    `);

    return results

}

export async function pullLatestUserTweet(id: string) {
    const results = await db.execute(sql`
        SELECT "Tweet".id, 
               "Tweet".content, 
               "Tweet".parent_tweet_id, 
               "Tweet".tweet_type, 
               "Tweet"."createdAt", 
STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
               users.name, 
               users.cover_image_url, 
               users.username,
               null AS retweeter,
               false AS retweeted,
               (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = "Tweet".id ) as likes,
               (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = "Tweet".id) as retweets,
               0 AS comments
        FROM "Tweet" 
        INNER JOIN users ON "Tweet".user_id = users.id 
        LEFT JOIN media ON media."tweetId" = "Tweet".id 
        WHERE "Tweet".user_id = ${id}
        GROUP BY "Tweet".id, 
             "Tweet".content, 
             "Tweet".parent_tweet_id, 
             "Tweet".tweet_type, 
             "Tweet"."createdAt", 
             users.name, 
             users.cover_image_url, 
             users.username
        ORDER BY "Tweet"."createdAt" DESC
        LIMIT 1
    `);
    return results
}

export async function pullTweetById(userId: string, id: string) {
    const results = await db.execute(sql` SELECT 
    t.id, 
    t.content, 
    t.parent_tweet_id, 
    t.tweet_type, 
    t."createdAt", 
    STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
    users.name, 
    users.cover_image_url, 
    users.username,
    (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id) AS likes,
    EXISTS (SELECT 1 FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${userId}) AS liked,
    (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) AS retweets,
    EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${userId}) AS retweeted,
    (SELECT COUNT(*) 
     FROM "Tweet" AS t_sub 
     WHERE t_sub.parent_tweet_id = t.id AND t_sub.tweet_type = 'REPLY') AS comments,
    NULL::text AS retweeter_username,
    t."createdAt" AS retweet_createdAt
FROM "Tweet" AS t
INNER JOIN users ON t.user_id = users.id 
LEFT JOIN media ON media."tweetId" = t.id 
WHERE t.id = ${id}
GROUP BY 
    t.id, 
    t.content, 
    t.parent_tweet_id, 
    t.tweet_type, 
    t."createdAt", 
    users.name, 
    users.cover_image_url, 
    users.username;
`);
    console.log(results.rows)
    return results
}

export async function pullCommentsById(replyId: string, offset: string | number, userId?: string) {

    const results = await db.execute(sql`SELECT t.id, 
       t.content, 
       t.parent_tweet_id, 
       t.tweet_type, 
       t."createdAt", 
       STRING_AGG(CONCAT(media.id, '|', media.url, '|', media.type), ',') AS media_info,
       users.name, 
       users.cover_image_url, 
       users.username,
       (SELECT COUNT(*) FROM "Likes" WHERE "Likes".tweet_id = t.id ) as likes,
       EXISTS (SELECT * FROM "Likes" WHERE "Likes".tweet_id = t.id AND "Likes".user_id = ${userId || "0"}) AS liked,
       (SELECT COUNT(*) FROM retweets WHERE retweets.parent_tweet_id = t.id) as retweets,
       EXISTS (SELECT 1 FROM retweets WHERE retweets.parent_tweet_id = t.id AND retweets.user_id = ${userId || "0"}) AS retweeted,
       replyingTo.username as "replyingTo",
       (SELECT COUNT(*) FROM "Tweet" AS t2 WHERE t2.parent_tweet_id = t.id AND t2.tweet_type = 'REPLY') as comments
FROM "Tweet" AS t
INNER JOIN users ON t.user_id = users.id
INNER JOIN users AS replyingTo ON t.user_id = (SELECT user_id FROM "Tweet" WHERE id = ${replyId})
LEFT JOIN media ON media."tweetId" = t.id 
WHERE t.parent_tweet_id = ${replyId} AND t.tweet_type = 'REPLY'
GROUP BY t.id, 
         t.content, 
         t.parent_tweet_id, 
         t.tweet_type, 
         t."createdAt", 
         users.name, 
         users.cover_image_url, 
         users.username,
         replyingTo.username
ORDER BY t."createdAt" DESC
OFFSET ${typeof offset == "string" ? parseInt(offset) : offset}
LIMIT 20;`);
    return results
}

export async function addLike(id: string) {
    const session = await auth();
    if (!session || !session.user) {
        return false
    }
    try {
        const result = db.select().from(likes).where(and(eq(likes.userId, session.user.id as string), eq(likes.tweetId, id)))
        if ((await result).length > 0) {
            await db.delete(likes).where(and(eq(likes.userId, session.user.id as string), eq(likes.tweetId, id)))
        } else {
            await db.insert(likes).values({ userId: session.user.id as string, tweetId: id });
        }
        return true
    }
    catch (error) {
        console.log(`Like Error : ${error} `)
        return false
    }


}

export async function retweet(id: string) {
    const session = await auth();
    if (!session || !session.user) {
        return false; // Ensure session and user are defined
    }

    try {

        const originalTweet = await db.select().from(tweet).where(eq(tweet.id, id));
        if (originalTweet.length === 0) {
            throw new Error("Original tweet not found");
        }

        const check = await db.select().from(retweets).where(and(eq(retweets.parentTweetId, id), eq(retweets.userId, session.user.id as string)));
        if (check.length > 0) {
            await db.delete(retweets).where(and(eq(retweets.parentTweetId, check[0].parentTweetId), eq(retweets.userId, check[0].userId)));
        } else {
            await db.insert(retweets).values({
                userId: session.user!.id as string,
                parentTweetId: originalTweet[0].id,
            });
        }



        return true;
    } catch (error) {
        console.error("Transaction failed:", error);
        return false;
    }
}
