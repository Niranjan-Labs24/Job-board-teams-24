import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Job } from '@/lib/types';

// GET all jobs
export async function GET() {
  try {
    const collection = await getCollection('jobs');
    const jobs = await collection.find({}).toArray();
    
    // Transform MongoDB documents to exclude _id
    const transformedJobs = jobs.map(job => {
      const { _id, ...jobData } = job;
      return jobData;
    });
    
    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection('jobs');
    
    const now = new Date().toISOString();
    const newJob: Omit<Job, '_id'> = {
      id: `job-${Date.now()}`,
      title: body.title,
      type: body.type || 'full-time',
      salaryMin: body.salaryMin || '',
      salaryMax: body.salaryMax || '',
      location: body.location || '',
      color: body.color || '#3B82F6',
      description: body.description || '',
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      benefits: body.benefits || [],
      status: body.status || 'draft',
      statusChangedAt: now,
      applicationDeadline: body.applicationDeadline,
      createdAt: now,
      updatedAt: now,
      applicationsCount: 0,
      templateId: body.templateId,
      category: body.category,
    };

    await collection.insertOne(newJob);
    
    // Exclude _id from response (MongoDB adds it during insert)
    const { _id, ...responseJob } = newJob as typeof newJob & { _id?: unknown };
    return NextResponse.json(responseJob, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
