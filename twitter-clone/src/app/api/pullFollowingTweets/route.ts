import { pullTweetsFromFollowing } from "@/app/lib/TweetActions/actions";
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
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("page");

    try {
        const response = await pullTweetsFromFollowing(session.user.id as string, offset);
        const result = response.rows;
        return NextResponse.json({ results: result });
    } catch (error) {
        console.error("Error fetching tweets:", error);
        return NextResponse.json({ error: "Failed to pull tweets" }, { status: 500 });
    }
}
