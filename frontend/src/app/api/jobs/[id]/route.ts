import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { Job, generateSlug } from '@/lib/types';

// GET single job by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if id is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const sql = isUUID 
      ? 'SELECT * FROM jobs WHERE id = $1'
      : 'SELECT * FROM jobs WHERE slug = $1';
    
    const job = await queryOne<Job>(sql, [id]);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;
    
    const allowedFields = [
      'title', 'type', 'salary_min', 'salary_max', 'location', 'color',
      'description', 'requirements', 'responsibilities', 'benefits',
      'status', 'closure_reason', 'application_deadline', 
      'meta_title', 'meta_description', 'category'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }
    
    // Update slug if title changed
    if (body.title) {
      updates.push(`slug = $${paramCount}`);
      values.push(generateSlug(body.title, id.slice(0, 8)));
      paramCount++;
    }
    
    // Always update timestamp
    updates.push(`updated_at = NOW()`);
    
    // Update status_changed_at if status changed
    if (body.status) {
      updates.push(`status_changed_at = NOW()`);
    }
    
    values.push(id);
    
    const sql = `
      UPDATE jobs 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const jobs = await query<Job>(sql, values);
    
    if (jobs.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(jobs[0]);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const rowCount = await execute('DELETE FROM jobs WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
