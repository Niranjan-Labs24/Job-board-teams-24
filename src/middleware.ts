import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const rateLimitMap = new Map();

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Rate Limiting for /api
    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limit = 60; // Increased limit slightly
        const windowMs = 60 * 1000;

        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, { count: 0, lastReset: Date.now() });
        }

        const ipData = rateLimitMap.get(ip);
        if (Date.now() - ipData.lastReset > windowMs) {
            ipData.count = 0;
            ipData.lastReset = Date.now();
        }

        if (ipData.count >= limit) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Too many requests' }),
                { status: 429, headers: { 'content-type': 'application/json' } }
            );
        }
        ipData.count += 1;
    }

    // 2. Auth & RBAC for /admin
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth_token')?.value;

        // Valid Token Check
        let payload = null;
        if (token) {
            payload = await verifyJWT(token);
        }

        // Case A: User is NOT logged in
        if (!payload) {
            // If trying to access /admin (login page), let them pass
            if (pathname === '/admin') {
                return NextResponse.next();
            }
            // If trying to access protected admin routes, redirect to login (/admin)
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        // Case B: User IS logged in
        // If they are at the login page, redirect to dashboard
        if (pathname === '/admin') {
            return NextResponse.redirect(new URL('/admin/jobs', request.url));
        }

        const role = payload.role as string;

        // Strict RBAC Rules
        if (pathname.startsWith('/admin/admin-management')) {
            if (role !== 'SUPER_ADMIN') {
                // Unauthorized for this specific page
                return NextResponse.redirect(new URL('/admin/jobs', request.url));
            }
        }

        // Allow access to other /admin routes for SUPER_ADMIN, ADMIN, HR
        if (!['SUPER_ADMIN', 'ADMIN', 'HR'].includes(role)) {
            // Invalid role? Logout/Login
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // 3. Legacy /login Redirect
    if (pathname === '/login') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*', '/admin/:path*', '/login'],
};
