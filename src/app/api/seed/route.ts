import { NextResponse } from 'next/server';
// import { query, execute } from '@/lib/db';
// import { generateSlug } from '@/lib/types';

// ... (SEED CONSTANTS hidden for brevity, can remain as is)

export async function POST() {
  return NextResponse.json({ message: 'Seed functionality temporarily disabled due to DB refactor' }, { status: 501 });
  /*
  try {
    // Clear existing data
    await execute('DELETE FROM candidate_notes');
    // ... rest of the code ...
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
  */
}
