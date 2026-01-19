import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const rateLimitMap = new Map();

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limit = 60;
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

    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth_token')?.value;

        let payload = null;
        if (token) {
            payload = await verifyJWT(token);
        }

        if (!payload) {
            if (pathname === '/admin') {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        if (pathname === '/admin') {
            return NextResponse.redirect(new URL('/admin/jobs', request.url));
        }

        const role = payload.role as string;

        if (pathname.startsWith('/admin/admin-management')) {
            if (role !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/admin/jobs', request.url));
            }
        }

        if (!['SUPER_ADMIN', 'ADMIN', 'HR'].includes(role)) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    if (pathname === '/login') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*', '/admin/:path*', '/login'],
};
