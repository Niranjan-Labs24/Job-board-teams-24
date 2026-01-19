import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        console.log(`[Request OTP] Checking whitelist for: ${email}`);

        // 1. Whitelist Check: Ensure user exists (Case Insensitive)
        // We use .ilike() for case-insensitive matching
        const { data: users, error: dbError } = await supabase
            .from('users')
            .select('id, role, email_verified')
            .ilike('email', email);

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
        }

        if (!users || users.length === 0) {
            console.log(`[Request OTP] Access Denied. User not found. Rows: 0`);
            return NextResponse.json({ error: 'Access denied. You must be invited by an Administrator.' }, { status: 403 });
        }

        console.log(`[Request OTP] User found. ID: ${users[0].id}. Sending Supabase OTP...`);

        // 2. Trigger Supabase OTP
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        if (error) {
            console.error("Supabase Auth Error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent via Supabase.' });

    } catch (error) {
        console.error('Request OTP error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
