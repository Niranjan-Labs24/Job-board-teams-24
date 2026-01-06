import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { generateSlug } from '@/lib/types';

const SEED_JOBS = [
  {
    title: 'Strategy & Operations',
    type: 'full-time',
    salary_min: '120k',
    salary_max: '200k',
    location: 'Chennai, Tamilnadu',
    color: '#EC4899',
    description: 'Lead strategic initiatives and optimize operations across the organization. Work with leadership to drive business growth.',
    requirements: ['5+ years experience in strategy/operations', 'MBA preferred', 'Strong analytical skills', 'Experience with data analysis'],
    responsibilities: ['Develop and execute strategic plans', 'Optimize operational processes', 'Lead cross-functional teams', 'Present findings to leadership'],
    benefits: ['Health insurance', 'Stock options', 'Remote work flexibility', 'Learning budget'],
    status: 'published',
    application_deadline: '2026-01-31',
    category: 'Operations',
  },
  {
    title: 'Full Stack Developer',
    type: 'full-time',
    salary_min: '200k',
    salary_max: '400k',
    location: 'Remote',
    color: '#3B82F6',
    description: 'Build and maintain scalable web applications using modern technologies. Join our engineering team to create cutting-edge solutions.',
    requirements: ['5+ years full-stack experience', 'React/Next.js expertise', 'Node.js/Python backend skills', 'Database design experience'],
    responsibilities: ['Design and implement features', 'Code reviews and mentoring', 'Collaborate with product team', 'Maintain code quality'],
    benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Conference budget'],
    status: 'published',
    application_deadline: '2026-01-15',
    category: 'Engineering',
  },
  {
    title: 'Senior Product Designer',
    type: 'full-time',
    salary_min: '250k',
    salary_max: '400k',
    location: 'Bangalore, Karnataka',
    color: '#F97316',
    description: 'Lead product design initiatives and create exceptional user experiences. Shape the future of our products.',
    requirements: ['7+ years UX/UI design', 'Strong portfolio', 'Figma expertise', 'User research experience'],
    responsibilities: ['Lead design projects', 'User research and testing', 'Design system maintenance', 'Collaborate with engineering'],
    benefits: ['Health insurance', 'Learning budget', 'Gym membership', 'Flexible work'],
    status: 'published',
    category: 'Design',
  },
  {
    title: 'Customer Success Manager',
    type: 'full-time',
    salary_min: '225k',
    salary_max: '400k',
    location: 'Remote',
    color: '#F472B6',
    description: 'Ensure customer success and drive product adoption across enterprise accounts. Build lasting relationships.',
    requirements: ['3+ years in customer success', 'Enterprise software experience', 'Excellent communication', 'CRM experience'],
    responsibilities: ['Manage customer relationships', 'Drive product adoption', 'Handle escalations', 'Gather feedback'],
    benefits: ['Health insurance', 'Performance bonus', 'Remote work', 'Career growth'],
    status: 'published',
    application_deadline: '2026-01-10',
    category: 'Customer Success',
  },
  {
    title: 'DevOps Engineer',
    type: 'full-time',
    salary_min: '180k',
    salary_max: '300k',
    location: 'Hybrid - Mumbai',
    color: '#8B5CF6',
    description: 'Build and maintain our cloud infrastructure. Automate deployments and ensure system reliability.',
    requirements: ['4+ years DevOps experience', 'AWS/GCP expertise', 'Kubernetes knowledge', 'CI/CD experience'],
    responsibilities: ['Manage cloud infrastructure', 'Automate deployments', 'Monitor system health', 'Security best practices'],
    benefits: ['Health insurance', 'Stock options', 'Learning budget', 'Flexible hours'],
    status: 'draft',
    category: 'Engineering',
  },
];

const SEED_APPLICATIONS = [
  { name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '+1 555-0101', position: 'Full Stack Developer', experience: '6 years', status: 'new', stage: 'new', rating: 4.5, linkedin: 'linkedin.com/in/sarahchen', portfolio: 'sarahchen.dev' },
  { name: 'Michael Johnson', email: 'michael.j@email.com', phone: '+1 555-0102', position: 'Full Stack Developer', experience: '4 years', status: 'screening', stage: 'screening', rating: 3.8, linkedin: 'linkedin.com/in/michaelj' },
  { name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '+1 555-0103', position: 'Full Stack Developer', experience: '8 years', status: 'interview_scheduled', stage: 'interview_scheduled', rating: 4.2 },
  { name: 'David Kim', email: 'david.kim@email.com', phone: '+1 555-0104', position: 'Senior Product Designer', experience: '9 years', status: 'new', stage: 'new', rating: 4.8, portfolio: 'davidkim.design' },
  { name: 'Jessica Williams', email: 'jessica.w@email.com', phone: '+1 555-0105', position: 'Strategy & Operations', experience: '7 years', status: 'interview_complete', stage: 'interview_complete', rating: 4.0 },
  { name: 'Alex Thompson', email: 'alex.t@email.com', phone: '+1 555-0106', position: 'Customer Success Manager', experience: '5 years', status: 'offer_pending', stage: 'offer_pending', rating: 4.6 },
  { name: 'Lisa Park', email: 'lisa.p@email.com', phone: '+1 555-0107', position: 'Full Stack Developer', experience: '3 years', status: 'new', stage: 'new', rating: 3.5 },
  { name: 'James Wilson', email: 'james.w@email.com', phone: '+1 555-0108', position: 'Senior Product Designer', experience: '6 years', status: 'screening', stage: 'screening', rating: 4.1, portfolio: 'jameswilson.co' },
];

export async function POST() {
  try {
    // Clear existing data
    await execute('DELETE FROM candidate_notes');
    await execute('DELETE FROM candidate_ratings');
    await execute('DELETE FROM applications');
    await execute('DELETE FROM jobs');
    await execute('DELETE FROM job_templates');
    
    // Insert jobs
    const jobIds: Record<string, string> = {};
    
    for (const job of SEED_JOBS) {
      const slug = generateSlug(job.title, Date.now().toString());
      
      const result = await query<{ id: string }>(
        `INSERT INTO jobs (
          slug, title, type, salary_min, salary_max, location, color,
          description, requirements, responsibilities, benefits,
          status, application_deadline, category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          slug, job.title, job.type, job.salary_min, job.salary_max,
          job.location, job.color, job.description, job.requirements,
          job.responsibilities, job.benefits, job.status,
          job.application_deadline || null, job.category
        ]
      );
      
      jobIds[job.title] = result[0].id;
    }
    
    // Insert applications
    for (const app of SEED_APPLICATIONS) {
      // Find matching job
      const jobTitle = app.position.includes('Developer') ? 'Full Stack Developer' 
        : app.position.includes('Designer') ? 'Senior Product Designer'
        : app.position.includes('Strategy') ? 'Strategy & Operations'
        : 'Customer Success Manager';
      
      const jobId = jobIds[jobTitle];
      
      if (jobId) {
        await execute(
          `INSERT INTO applications (
            job_id, name, email, phone, position, experience,
            status, stage, rating, linkedin, portfolio
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            jobId, app.name, app.email, app.phone, app.position,
            app.experience, app.status, app.stage, app.rating,
            app.linkedin || null, app.portfolio || null
          ]
        );
        
        // Update job applications count
        await execute(
          'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1',
          [jobId]
        );
      }
    }
    
    // Insert some sample ratings and notes
    const apps = await query<{ id: string; name: string }>(
      'SELECT id, name FROM applications LIMIT 3'
    );
    
    for (const app of apps) {
      // Add rating
      await execute(
        `INSERT INTO candidate_ratings (application_id, category, score, max_score, reviewer_name)
         VALUES ($1, 'Technical Skills', $2, 10, 'Admin User')`,
        [app.id, Math.floor(Math.random() * 3) + 7]
      );
      
      // Add note
      await execute(
        `INSERT INTO candidate_notes (application_id, author_name, note_type, content, visibility)
         VALUES ($1, 'Admin User', 'general', $2, 'team')`,
        [app.id, `Initial review of ${app.name}'s application. Strong candidate.`]
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        jobs: SEED_JOBS.length,
        applications: SEED_APPLICATIONS.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
}
