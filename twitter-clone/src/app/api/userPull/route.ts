import { pullUsers } from "@/app/lib/actions";
import { NextResponse } from "next/server";
export async function GET() {
    try {
        const results = await pullUsers();
        return NextResponse.json({
            result: results,
            message: "Successfully pulled users"
        })
    } catch (error) {
        return NextResponse.json({
            message: "Failed to pull users",
            result: []
        })
    }
}