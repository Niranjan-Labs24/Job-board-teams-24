import { NextRequest, NextResponse } from 'next/server';
import { getApplicationById, updateApplication, supabase } from '@/lib/db';

// GET single application with ratings and notes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get application with job info
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(title, slug)
      `)
      .eq('id', id)
      .single();
    
    if (appError && appError.code !== 'PGRST116') throw appError;
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Get ratings
    const { data: ratings } = await supabase
      .from('candidate_ratings')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false });
    
    // Get notes
    const { data: notes } = await supabase
      .from('candidate_notes')
      .select('*')
      .eq('application_id', id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    return NextResponse.json({
      ...application,
      job_title: application.jobs?.title,
      job_slug: application.jobs?.slug,
      jobs: undefined,
      ratings: ratings || [],
      notes: notes || [],
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
    
    const allowedFields = [
      'name', 'email', 'phone', 'position', 'resume_url',
      'linkedin', 'portfolio', 'cover_letter', 'experience',
      'status', 'stage', 'rating', 'is_archived'
    ];
    
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Update stage_changed_at if stage changed
    if (body.stage || body.status) {
      updateData.stage_changed_at = new Date().toISOString();
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    const application = await updateApplication(id, updateData);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json(application);
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
    const app = await getApplicationById(id);
    
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Delete application
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update job applications count
    if (app.job_id) {
      const { data: job } = await supabase
        .from('jobs')
        .select('applications_count')
        .eq('id', app.job_id)
        .single();
      
      if (job) {
        await supabase
          .from('jobs')
          .update({ applications_count: Math.max((job.applications_count || 0) - 1, 0) })
          .eq('id', app.job_id);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
