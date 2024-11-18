import { pullLatestUserTweet } from "@/app/lib/TweetActions/actions";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function GET(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({
            results: [],
            message: "failed"
        }, { status: 400 })
    }
    try {
        const response = await pullLatestUserTweet(session.user.id as string);
        const result = response.rows;
        return NextResponse.json({ results: result });
    } catch (error) {
        console.error("Error fetching tweet:", error);
        return NextResponse.json({ error: "Failed to pull tweet" }, { status: 500 });
    }
}
