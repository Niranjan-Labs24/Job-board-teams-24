import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    return NextResponse.json({ message: "LinkedIn Auth is temporarily disabled" }, { status: 503 });
    /*
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const encodedState = searchParams.get('state');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;

        // 1. Exchange code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId!,
                client_secret: clientSecret!,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) throw new Error(tokenData.error_description);

        const accessToken = tokenData.access_token;

        // 2. Fetch User Profile (using OpenID Connect)
        const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userResponse.json();

        // Decode state to get job info
        const state = JSON.parse(Buffer.from(encodedState!, 'base64').toString('utf-8'));
        const { jobSlug } = state;

        // 3. Redirect back to job page with user data as query params
        const returnUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/${jobSlug}`);
        returnUrl.searchParams.set('apply', 'true');
        returnUrl.searchParams.set('name', `${userData.given_name} ${userData.family_name}`);
        returnUrl.searchParams.set('email', userData.email);

        // LinkedIn Profile URL is sometimes in userData.profile or vanityName
        // If not available, we can't fetch it easily with standard OIDC
        if (userData.profile) {
            returnUrl.searchParams.set('linkedinUrl', userData.profile);
        }

        return NextResponse.redirect(returnUrl.toString());
    } catch (error: any) {
        console.error('LinkedIn Auth Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    */
}
