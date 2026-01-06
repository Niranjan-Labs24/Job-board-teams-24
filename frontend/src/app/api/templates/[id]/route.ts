import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

// DELETE template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const rowCount = await execute('DELETE FROM job_templates WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
