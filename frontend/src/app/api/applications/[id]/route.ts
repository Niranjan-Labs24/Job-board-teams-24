import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { Application, CandidateRating, CandidateNote } from '@/lib/types';

// GET single application with ratings and notes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get application with job info
    const application = await queryOne<Application>(
      `SELECT a.*, j.title as job_title, j.slug as job_slug
       FROM applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    );
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Get ratings
    const ratings = await query<CandidateRating>(
      'SELECT * FROM candidate_ratings WHERE application_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    // Get notes
    const notes = await query<CandidateNote>(
      'SELECT * FROM candidate_notes WHERE application_id = $1 ORDER BY is_pinned DESC, created_at DESC',
      [id]
    );
    
    return NextResponse.json({
      ...application,
      ratings,
      notes,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

// PUT update application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;
    
    const allowedFields = [
      'name', 'email', 'phone', 'position', 'resume_url',
      'linkedin', 'portfolio', 'cover_letter', 'experience',
      'status', 'stage', 'rating', 'is_archived'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }
    
    // Update stage_changed_at if stage changed
    if (body.stage || body.status) {
      updates.push(`stage_changed_at = NOW()`);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    values.push(id);
    
    const sql = `
      UPDATE applications 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const applications = await query<Application>(sql, values);
    
    if (applications.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json(applications[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get job_id before deleting
    const app = await queryOne<Application>(
      'SELECT job_id FROM applications WHERE id = $1',
      [id]
    );
    
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Delete application
    await execute('DELETE FROM applications WHERE id = $1', [id]);
    
    // Update job applications count
    await execute(
      'UPDATE jobs SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = $1',
      [app.job_id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
