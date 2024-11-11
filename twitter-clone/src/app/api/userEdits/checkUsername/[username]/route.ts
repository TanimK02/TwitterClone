import { NextResponse } from "next/server";
import { checkUsernameStatus } from "@/app/lib/actions";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    try {

        const check = await checkUsernameStatus(username);
        const statusCode = check.status
        return NextResponse.json({
            message: check.message,
            result: check.result
        },
            { status: statusCode })

    } catch (error) {
        return NextResponse.json({

            message: "Internal Server Error",
            result: false
        }, { status: 500 })
    }
}

