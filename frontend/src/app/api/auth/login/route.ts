import { NextRequest, NextResponse } from 'next/server';

// Simple mock auth - in production, use proper JWT/session handling
const ADMIN_CREDENTIALS = {
  email: 'admin@jobboard.com',
  password: 'admin123',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin-1',
          email: ADMIN_CREDENTIALS.email,
          name: 'Admin User',
          role: 'admin',
        },
        token: 'mock-jwt-token', // In production, generate real JWT
      });
    }
    
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
