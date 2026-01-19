import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const schemaPath = path.join(process.cwd(), 'src', 'lib', 'auth-schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        await execute(sql);

        return NextResponse.json({ success: true, message: 'Auth Schema migrated and Super Admin seeded.' });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 });
    }
}
