import { NextRequest, NextResponse } from 'next/server';
import { getJobs, createJob } from '@/lib/db';
import { generateSlug } from '@/lib/types';


export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const includeArchived = searchParams.get('includeArchived') === 'true';

    console.log('Fetching jobs with:', { status, includeArchived });

    const jobs = await getJobs({ status, includeArchived });

    console.log('Jobs fetched:', jobs.length);

    const response = NextResponse.json(jobs);
    // response.headers.set('Cache-Control', 'no-store'); // REMOVED for efficiency
    return response;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs', details: String(error) }, { status: 500 });
  }
}

// POST create new job
export async function POST(request: NextRequest) {
  try {
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
    };

    const job = await createJob(jobData);

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
