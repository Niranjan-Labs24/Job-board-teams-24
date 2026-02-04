import { NextRequest, NextResponse } from 'next/server';
import { getApplications, createApplication } from '@/lib/db';

// GET all applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId') || undefined;
    const status = searchParams.get('status') || undefined;
    const stage = searchParams.get('stage') || undefined;

    const applications = await getApplications({ jobId, status, stage });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const appData = {
      job_id: body.job_id || body.jobId,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      position: body.position,
      resume_url: body.resume_url || body.resumeUrl || null,
      linkedin: body.linkedin || body.linkedIn || null,
      portfolio: body.portfolio || null,
      cover_letter: body.cover_letter || body.coverLetter || null,
      experience: body.experience || '',
      status: 'new',
      stage: 'new',
    };

    if (!appData.resume_url) {
      return NextResponse.json({ error: 'Resume is required' }, { status: 400 });
    }

    const application = await createApplication(appData);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
