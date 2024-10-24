import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const session = await auth();

    // Redirect to signUp if no session and not already on the signUp page
    if ((!session || !session.user) && (pathname !== '/signUp' && pathname !== "/login")) {
        return NextResponse.redirect(new URL('/signUp', request.url));
    }

    // Redirect to Home if logged in and on the root or signUp page
    if (session && session.user && !session.user.username) {
        return NextResponse.redirect(new URL('/Home', request.url));
    }

    if (session && session.user && (pathname === '/' || pathname === '/signUp' || pathname == "/login")) {
        return NextResponse.redirect(new URL('/Home', request.url));
    }

    return NextResponse.next();
}

// Use matchers to specify which routes the middleware applies to
export const config = {
    matcher: ['/Home/:path*', '/Communities/:path*', '/', '/signUp', '/login'],
};