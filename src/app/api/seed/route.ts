import { NextResponse } from 'next/server';



export async function POST() {
  return NextResponse.json({ message: 'Seed functionality temporarily disabled due to DB refactor' }, { status: 501 });

}
