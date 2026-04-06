import { NextRequest, NextResponse } from 'next/server';
import { getJobs, createJob, autoPauseExpiredJobs } from '@/lib/db';
import { generateSlug } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { verifyJWT } from '@/lib/jwt';


export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    // Automatically pause jobs that have passed their deadline
    await autoPauseExpiredJobs();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? await verifyJWT(token) : null;
    const userId = payload?.userId as string | undefined;
    const userRole = payload?.role as string | undefined;

    console.log('Fetching jobs for:', { userId, userRole, status, includeArchived });

    const jobs = await getJobs({ 
      status, 
      includeArchived,
      userId,
      userRole
    });

    console.log('Jobs fetched:', jobs.length);

    const response = NextResponse.json(jobs);
    return response;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !['SUPER_ADMIN', 'ADMIN'].includes(payload.role as string)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Generate slug from title
    const tempId = Date.now().toString();
    const slug = generateSlug(body.title, tempId);

    const jobData = {
      slug,
      title: body.title,
      type: body.type || 'full-time',
      salary_min: body.salary_min || '',
      salary_max: body.salary_max || '',
      location: body.location || '',
      color: body.color || '#3B82F6',
      description: body.description || '',
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      benefits: body.benefits || [],
      status: body.status || 'draft',
      application_deadline: body.application_deadline || null,
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.description?.substring(0, 160),
      template_id: body.template_id || null,
      category: body.category || null,
      currency: body.currency || 'USD',
      visibility: body.visibility || 'ALL_HR',
      hr_assignments: body.hr_assignments || [],
      creatorId: payload.userId,
      creatorRole: payload.role,
    };

    const job = await createJob(jobData);

    // Revalidate paths to reflect the new job
    revalidatePath('/');
    revalidatePath('/careers');

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
