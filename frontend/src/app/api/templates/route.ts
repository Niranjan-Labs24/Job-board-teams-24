import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { JobTemplate } from '@/lib/types';

// GET all templates
export async function GET() {
  try {
    const templates = await query<JobTemplate>(
      'SELECT * FROM job_templates ORDER BY created_at DESC'
    );
    
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
    
    const sql = `
      INSERT INTO job_templates (
        name, category, title, type, salary_min, salary_max,
        location, description, requirements, responsibilities, benefits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const params = [
      body.name,
      body.category || 'General',
      body.title,
      body.type || 'full-time',
      body.salary_min || '',
      body.salary_max || '',
      body.location || '',
      body.description || '',
      body.requirements || [],
      body.responsibilities || [],
      body.benefits || [],
    ];
    
    const templates = await query<JobTemplate>(sql, params);
    
    return NextResponse.json(templates[0], { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
