import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { JobTemplate } from '@/lib/types';

// GET all templates
export async function GET() {
  try {
    const collection = await getCollection('templates');
    const templates = await collection.find({}).toArray();
    
    const transformedTemplates = templates.map(template => {
      const { _id, ...templateData } = template;
      return templateData;
    });
    
    return NextResponse.json(transformedTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection('templates');
    
    const now = new Date().toISOString();
    const newTemplate: Omit<JobTemplate, '_id'> = {
      id: `template-${Date.now()}`,
      name: body.name,
      category: body.category || 'General',
      title: body.title,
      type: body.type || 'full-time',
      salaryMin: body.salaryMin || '',
      salaryMax: body.salaryMax || '',
      location: body.location || '',
      description: body.description || '',
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      benefits: body.benefits || [],
      createdAt: now,
    };

    await collection.insertOne(newTemplate);
    
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
