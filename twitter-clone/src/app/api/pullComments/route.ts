import { pullCommentsById } from "@/app/lib/TweetActions/actions";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const session = await auth();
    const tweetId = searchParams.get("tweetId")
    let offset = searchParams.get("offset")
    if (!offset) {
        offset = "0"
    }
    if (!tweetId) {
        return NextResponse.json({ error: "Need tweet id" }, { status: 400 })
    }
    try {
        const response = session && session.user ? await pullCommentsById(tweetId, offset, session.user.id) : await pullCommentsById(tweetId, offset);
        const result = response.rows;
        return NextResponse.json({ results: result });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to pull comments" }, { status: 500 });
    }
}
