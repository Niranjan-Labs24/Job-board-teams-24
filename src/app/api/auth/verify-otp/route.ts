import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // 1. Verify OTP with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        if (error) {
            console.error("Supabase Verify Error:", error);
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        // 2. Fetch Internal User Role (Case Insensitive)
        const { data: users, error: dbError } = await supabase
            .from('users')
            .select('id, role, name')
            .ilike('email', email);

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: 'Database error during role fetch' }, { status: 500 });
        }

        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'User not found in whitelist.' }, { status: 404 });
        }
        const user = users[0];

        // 3. Generate Custom JWT
        const token = await signJWT({ userId: user.id, email, role: user.role });

        // 4. Create Response with Cookie
        const response = NextResponse.json({
            success: true,
            user: { email, role: user.role, name: user.name },
            redirectUrl: user.role === 'SUPER_ADMIN' ? '/admin/admin-management' : '/admin'
        });

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
