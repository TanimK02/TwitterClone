import { NextResponse } from "next/server";
import { z } from "zod";
import { getSignedURL } from "@/app/lib/TweetActions/actions";
import { changeProfilePicture } from "@/app/lib/actions";
const mediaSchema = z.object(
    {
        type: z.string(),
        size: z.number(),
        checksum: z.string()
    }
)

export async function POST(request: Request) {
    const data = await request.json()

    if (!mediaSchema.safeParse(data)) {
        return NextResponse.json({
            result: {},
            message: "Please check parameters sent."
        }, { status: 400 })
    }

    try {
        const result = await getSignedURL(data.type, data.size, data.checksum);

        if (!("success" in result)) {
            return NextResponse.json({
                result: result.failure,
                message: "Please check parameters sent or be sure to be logged in."
            }, { status: 400 })
        }
        return NextResponse.json({
            result: result.success,
            message: "Successfully retrieved url."
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            result: {},
            message: "Internal Server Error. Please try again."
        }, { status: 500 })
    }

}

const mediaUrl = z.object({
    mediaUrl: z.string().url("Please send a valid url")
})

export async function PUT(request: Request) {

    const data = await request.json();

    try {
        mediaUrl.parse(data)
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                errors: error.issues,
                message: "failed"
            }, { status: 400 })
        }
    }

    try {
        const result = await changeProfilePicture(data.mediaUrl)
        if (result.status == 200) {
            return NextResponse.json({
                errors: null,
                message: "succeeded"
            }, { status: 200 })
        }
        else {
            throw new Error("Failed")
        }
    }
    catch (error) {
        return NextResponse.json({
            errors: [],
            message: "Failed"
        }, { status: 500 })
    }

}