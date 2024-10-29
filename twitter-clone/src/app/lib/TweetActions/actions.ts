"use server"

import { auth } from "@/auth"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from "@/app/lib/db"
import crypto from "crypto";
import { Prisma } from '@prisma/client';
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


    const mediaResult = await prisma.media.create({
        data: {
            url: signedURL.split("?")[0],
            userId: session.user.id,
            type: type
        },
        select: {
            id: true
        }
    }
    )

    return { success: { url: signedURL, mediaId: mediaResult.id } }
}

export async function createTweet({ content, mediaIds }: { content: string, mediaIds?: string[] }) {

    const session = await auth();
    if (!session || !session.user) {
        return { failure: "No user." }
    }

    let tweet = null;

    try {
        if (mediaIds && mediaIds.length > 0) {
            const foundMedia = await prisma.media.findMany({
                where: {
                    id: { in: mediaIds },
                    userId: session.user.id
                }
            });

            if (foundMedia.length !== mediaIds.length) {
                return { failure: "Some media entries are missing or do not belong to the user." };
            }

            tweet = await prisma.tweet.create({
                data: {
                    userId: session.user.id as string,
                    content: content,
                    media: {
                        connect: mediaIds.map(mediaid => ({ id: mediaid }))

                    }
                }
            })
        }
        else {
            tweet = await prisma.tweet.create({
                data: {
                    userId: session.user.id as string,
                    content: content,
                }
            })
        }

    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Known Prisma error, e.g., unique constraint violation
            console.error("Prisma error code:", error.code);
        } else {
            // Other unexpected errors
            console.error("Unexpected error:", error);
        }
        return { failure: "An error occurred while creating the tweet." };
    }
    finally {
        if (tweet) {
            console.log(tweet)
            revalidatePath("/Home")
            redirect("/Home")
        }
    }


}
