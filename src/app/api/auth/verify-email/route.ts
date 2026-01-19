import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // 1. Verify OTP
        const otpRecords = await query<{ expires_at: Date }>(
            `SELECT expires_at FROM otp_codes 
       WHERE email = $1 AND otp = $2 AND type = 'VERIFICATION' 
       ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );

        if (otpRecords.length === 0) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
        }

        const record = otpRecords[0];
        if (new Date() > new Date(record.expires_at)) {
            return NextResponse.json({ error: 'Verification code expired' }, { status: 401 });
        }

        // 2. Mark User as Verified
        await execute('UPDATE users SET email_verified = TRUE WHERE email = $1', [email]);

        // 3. Cleanup OTP
        await execute('DELETE FROM otp_codes WHERE email = $1 AND otp = $2', [email, otp]);

        return NextResponse.json({ success: true, message: 'Email verified successfully. You can now login.' });

    } catch (error) {
        console.error('Email verify error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
