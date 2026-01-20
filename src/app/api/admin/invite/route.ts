import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || (payload.role as string) !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Super Admin only.' }, { status: 403 });
        }

        const { email, name, role } = await request.json();

        if (!email || !name || !role) {
            return NextResponse.json({ error: 'Email, Name, and Role (ADMIN/HR) are required' }, { status: 400 });
        }

        if (!['ADMIN', 'HR'].includes(role)) {
            return NextResponse.json({ error: 'Role must be ADMIN or HR' }, { status: 400 });
        }

        // 1. Create User (Whitelist)
        // We insert into public.users. 
        // They are "Unverified" until they successfully login via Supabase OTP, 
        // but since we whitelist them here, they CAN login now.

        // Check key constraint ideally, but insert() handles simple cases usually.
        // We assume 'email_verified' defaults to false (or true since we trust Admin).
        // Let's set email_verified to TRUE because if Admin invites them, they are trusted.
        // The actual "Verification" is proving ownership of email via OTP Login.

        const { error: insertError } = await supabase
            .from('users')
            .insert({ email, name, role, email_verified: true });

        if (insertError) {
            console.error("Invite Error:", insertError);
            if (insertError.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'User already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
        }

        // 2. Send OTP Email (Verification)
        // Since we don't have Service Role Key for inviteUserByEmail,
        // we trigger a login OTP so they get an email immediately.
        // We set shouldCreateUser: true so it creates them in Supabase Auth if needed.
        const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        if (otpError) {
            console.error("OTP Error during invite:", otpError);
            return NextResponse.json({
                success: true,
                message: `User ${email} invited/whitelisted. However, failed to send auto-email: ${otpError.message}. Ask them to login directly.`
            });
        }

        return NextResponse.json({ success: true, message: `User ${email} invited and verification code sent.` });

    } catch (error) {
        console.error('Invite error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
