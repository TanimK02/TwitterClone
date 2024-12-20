import { pullTweetsFromUser } from "@/app/lib/TweetActions/actions";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const offset = searchParams.get("page");
    const session = await auth();
    if (!username) {
        return NextResponse.json({ error: "Username parameter is missing" }, { status: 400 });
    }

    try {
        const response = session && session.user ? await pullTweetsFromUser(username, offset, session.user.id) : await pullTweetsFromUser(username, offset);
        const result = response.rows;
        return NextResponse.json({ results: result });
    } catch (error) {
        console.error("Error fetching tweets:", error);
        return NextResponse.json({ error: "Failed to pull tweets" }, { status: 500 });
    }
}
