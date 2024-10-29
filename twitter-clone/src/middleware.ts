import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserById } from "./app/lib/actions";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await auth();
    const isAuthenticated = session && session.user;

    // Redirect to signUp if not authenticated and not already on signUp or login page
    if (!isAuthenticated && pathname !== '/signUp' && pathname !== "/login") {
        return NextResponse.redirect(new URL('/signUp', request.url));
    }

    let username: string | null = null;
    if (session?.user?.id) {
        const user = await getUserById(session?.user?.id)
        if (user && typeof user !== "undefined") {
            username = user?.username;
        }
    }

    // Redirect to Home if authenticated but missing username
    if (isAuthenticated && (!username || typeof username == "undefined") && pathname !== '/Home') {
        return NextResponse.redirect(new URL('/Home', request.url));
    }

    // Redirect to Home if authenticated and on restricted pages
    if (isAuthenticated && (pathname === '/' || pathname === '/signUp' || pathname === "/login")) {
        return NextResponse.redirect(new URL('/Home', request.url));
    }

    return NextResponse.next();
}

// Use matchers to specify which routes the middleware applies to
export const config = {
    matcher: ['/Home/:path*', '/', '/signUp', '/login'],
};