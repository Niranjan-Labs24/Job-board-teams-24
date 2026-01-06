import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/db';

export async function GET() {
  try {
    await checkHealth();
    
    return NextResponse.json({ 
      status: 'healthy', 
      service: 'Teams 24 Careers API (Next.js + Supabase)',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'unhealthy', 
      error: 'Database connection failed' 
    }, { status: 500 });
  }
}
