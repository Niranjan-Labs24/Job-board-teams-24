import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ 
      status: 'healthy', 
      service: 'Teams 24 Careers API (Next.js)',
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
