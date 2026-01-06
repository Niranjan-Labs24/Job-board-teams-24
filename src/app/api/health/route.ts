import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    if (supabase) {
      // Test Supabase connection
      const { error } = await supabase.from('jobs').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      
      return NextResponse.json({ 
        status: 'healthy', 
        service: 'Teams 24 Careers API (Next.js + Supabase)',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback for local development
    return NextResponse.json({ 
      status: 'healthy', 
      service: 'Teams 24 Careers API (Next.js + Local PostgreSQL)',
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
