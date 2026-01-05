import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Application } from '@/lib/types';

// GET all applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    
    const collection = await getCollection('applications');
    
    const query: Record<string, string> = {};
    if (jobId) query.jobId = jobId;
    if (status) query.status = status;
    
    const applications = await collection.find(query).toArray();
    
    const transformedApplications = applications.map(app => {
      const { _id, ...appData } = app;
      return appData;
    });
    
    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection('applications');
    const jobsCollection = await getCollection('jobs');
    
    const now = new Date().toISOString();
    const newApplication: Omit<Application, '_id'> = {
      id: `app-${Date.now()}`,
      jobId: body.jobId,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      position: body.position,
      resumeUrl: body.resumeUrl,
      linkedIn: body.linkedIn,
      portfolio: body.portfolio,
      coverLetter: body.coverLetter,
      experience: body.experience || '',
      status: 'new',
      rating: 0,
      stage: 'new',
      appliedAt: now,
      notes: [],
      ratings: [],
    };

    await collection.insertOne(newApplication);
    
    // Increment job's application count
    await jobsCollection.updateOne(
      { id: body.jobId },
      { $inc: { applicationsCount: 1 } }
    );
    
    // Exclude _id from response (MongoDB adds it during insert)
    const { _id, ...responseApplication } = newApplication as typeof newApplication & { _id?: unknown };
    return NextResponse.json(responseApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
