import { pullTweets } from "@/app/lib/TweetActions/actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get("timestamp");
    console.log(timestamp)
    if (!timestamp) {
        return NextResponse.json({ error: "Timestamp parameter is missing" }, { status: 400 });
    }

    try {
        const response = await pullTweets(timestamp);
        const result = response.rows;
        return NextResponse.json({ results: result });
    } catch (error) {
        console.error("Error fetching tweets:", error);
        return NextResponse.json({ error: "Failed to pull tweets" }, { status: 500 });
    }
}
