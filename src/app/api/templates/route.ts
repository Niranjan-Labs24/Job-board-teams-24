import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, createTemplate, deleteTemplate } from '@/lib/db';

// GET all templates
export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const templateData = {
      name: body.name,
      category: body.category || 'General',
      title: body.title,
      type: body.type || 'full-time',
      salary_min: body.salary_min || '',
      salary_max: body.salary_max || '',
      location: body.location || '',
      description: body.description || '',
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      benefits: body.benefits || [],
      currency: body.currency || 'USD',
    };

    const template = await createTemplate(templateData);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
