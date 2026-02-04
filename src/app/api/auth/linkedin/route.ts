import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    return NextResponse.json({ message: "LinkedIn Auth is temporarily disabled" }, { status: 503 });
    /*
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const jobSlug = searchParams.get('jobSlug');
  
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;
    const scope = 'openid profile email';
    
    // State includes jobId and jobSlug so we know where to return to
    const state = JSON.stringify({ jobId, jobSlug });
    const encodedState = Buffer.from(state).toString('base64');
  
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodedState}&scope=${encodeURIComponent(scope)}`;
  
    return NextResponse.redirect(linkedinAuthUrl);
    */
}
