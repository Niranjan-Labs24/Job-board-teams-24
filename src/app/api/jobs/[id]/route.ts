import { NextRequest, NextResponse } from 'next/server';
import { getJobById, getJobBySlug, updateJob, deleteJob } from '@/lib/db';
import { generateSlug } from '@/lib/types';

// GET single job by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if id is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const job = isUUID ? await getJobById(id) : await getJobBySlug(id);
    
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
    
    const allowedFields = [
      'title', 'type', 'salary_min', 'salary_max', 'location', 'color',
      'description', 'requirements', 'responsibilities', 'benefits',
      'status', 'closure_reason', 'application_deadline', 
      'meta_title', 'meta_description', 'category'
    ];
    
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Update slug if title changed
    if (body.title) {
      updateData.slug = generateSlug(body.title, id.slice(0, 8));
    }
    
    // Always update timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update status_changed_at if status changed
    if (body.status) {
      updateData.status_changed_at = new Date().toISOString();
    }
    
    const job = await updateJob(id, updateData);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(job);
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
    
    await deleteJob(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
