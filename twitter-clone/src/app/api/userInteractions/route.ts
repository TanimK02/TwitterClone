import { followUser } from "@/app/lib/actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({
            result: "Fail",
            message: "Username is required"
        }, { status: 400 })
    }

    try {
        const response = await followUser(username);
        return response
    } catch (error) {
        return NextResponse.json({
            result: "Fail",
            message: "Internal Server Error"
        }, { status: 500 })
    }

}