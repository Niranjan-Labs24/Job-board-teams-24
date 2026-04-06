import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getJobs(options?: { 
  status?: string; 
  includeArchived?: boolean;
  userId?: string;
  userRole?: string;
}) {
  // Automatically pause expired jobs before fetching
  try {
    await autoPauseExpiredJobs();
  } catch (err) {
    console.error('Failed to auto-pause expired jobs:', err);
  }

  let query = supabase.from('jobs').select('*, job_hr_assignments(user_id)');

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (!options?.includeArchived) {
    query = query.neq('status', 'archived');
  }

  // Role-based filtering for Admin/HR
  if (['ADMIN', 'HR'].includes(options?.userRole || '') && options?.userId) {
    // Both ADMIN and HR can see jobs where visibility is ALL_HR OR they are specifically assigned
    const { data: assignments } = await supabase
      .from('job_hr_assignments')
      .select('job_id')
      .eq('user_id', options.userId);
    
    const assignedIds = assignments?.map(a => a.job_id) || [];
    
    if (assignedIds.length > 0) {
      query = query.or(`visibility.eq.ALL_HR,id.in.(${assignedIds.join(',')})`);
    } else {
      query = query.eq('visibility', 'ALL_HR');
    }
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map(job => ({
    ...job,
    hr_assignments: (job.job_hr_assignments as any[])?.map(a => a.user_id) || []
  }));
}

export async function autoPauseExpiredJobs() {
  // 1. Fetch all published jobs that have a deadline
  const { data: jobs, error: fetchError } = await supabase
    .from('jobs')
    .select('id, application_deadline, status')
    .eq('status', 'published')
    .not('application_deadline', 'is', null);

  if (fetchError || !jobs || jobs.length === 0) return 0;

  // 2. Filter expired jobs in JavaScript for reliable date comparison
  const now = new Date();
  const expiredJobIds = jobs
    .filter(job => {
      const deadline = new Date(job.application_deadline);
      return deadline < now;
    })
    .map(job => job.id);

  if (expiredJobIds.length === 0) return 0;

  // 3. Batch update the expired jobs
  const statusUpdateDate = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ 
      status: 'paused',
      status_changed_at: statusUpdateDate,
      updated_at: statusUpdateDate
    })
    .in('id', expiredJobIds);

  if (updateError) {
    console.error(`Failed to auto-pause ${expiredJobIds.length} jobs:`, updateError);
    return 0;
  }
  
  console.log(`Successfully auto-paused ${expiredJobIds.length} expired jobs.`);
  return expiredJobIds.length;
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getJobBySlug(slug: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createJob(jobData: Record<string, any>) {
  const { hr_assignments, creatorId, creatorRole, ...rest } = jobData;
  
  // Add creatorId as created_by if available
  if (creatorId) {
    (rest as any).created_by = creatorId;
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert(rest)
    .select()
    .single();

  if (error) throw error;

  let finalAssignments = Array.isArray(hr_assignments) ? [...hr_assignments] : [];

  // Auto-assign creator if they are an ADMIN and it's SELECTED_HR
  if (creatorId && creatorRole === 'ADMIN' && jobData.visibility === 'SELECTED_HR') {
    if (!finalAssignments.includes(creatorId)) {
      finalAssignments.push(creatorId);
    }
  }

  if (finalAssignments.length > 0) {
    const assignments = finalAssignments.map((userId: string) => ({
      job_id: data.id,
      user_id: userId
    }));

    const { error: assignError } = await supabase
      .from('job_hr_assignments')
      .insert(assignments);

    if (assignError) throw assignError;
  }

  return { ...data, hr_assignments: hr_assignments || [] };
}

export async function updateJob(id: string, jobData: Record<string, any>) {
  const { hr_assignments, ...rest } = jobData;

  const { data, error } = await supabase
    .from('jobs')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Handle HR assignments update
  if (hr_assignments !== undefined && Array.isArray(hr_assignments)) {
    // Delete existing
    await supabase.from('job_hr_assignments').delete().eq('job_id', id);
    
    // Insert new
    if (hr_assignments.length > 0) {
      const assignments = hr_assignments.map((userId: string) => ({
        job_id: id,
        user_id: userId
      }));
      const { error: assignError } = await supabase
        .from('job_hr_assignments')
        .insert(assignments);
      
      if (assignError) throw assignError;
    }
  }

  return { ...data, hr_assignments: hr_assignments || [] };
}

export async function deleteJob(id: string) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getApplications(options?: { 
  jobId?: string; 
  status?: string; 
  stage?: string;
  userId?: string;
  userRole?: string;
}) {
  let query = supabase.from('applications').select(`
    *,
    jobs(id, title, slug, visibility)
  `);

  if (options?.jobId && options.jobId !== 'all') {
    query = query.eq('job_id', options.jobId);
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.stage && options.stage !== 'all') {
    query = query.eq('stage', options.stage);
  }

  query = query.eq('is_archived', false);
  query = query.order('applied_at', { ascending: false });

  let { data, error } = await query;
  if (error) throw error;

  // Role-based filtering for Admin/HR
  if (['ADMIN', 'HR'].includes(options?.userRole || '') && options?.userId) {
    // We need to filter applications based on whether User is assigned to the job
    const { data: assignments } = await supabase
      .from('job_hr_assignments')
      .select('job_id')
      .eq('user_id', options.userId);
    
    const assignedIds = assignments?.map(a => a.job_id) || [];
    
    data = (data || []).filter((app: any) => {
      const job = app.jobs as any;
      return job.visibility === 'ALL_HR' || assignedIds.includes(job.id);
    });
  }

  return (data || []).map((app: Record<string, any>) => ({
    ...app,
    job_title: (app.jobs as Record<string, any>)?.title,
    job_slug: (app.jobs as Record<string, any>)?.slug,
    jobs: undefined,
  }));
}

export async function getApplicationById(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createApplication(appData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('applications')
    .insert(appData)
    .select()
    .single();

  if (error) throw error;

  if (appData.job_id) {
    await supabase.rpc('increment_applications_count', { job_id: appData.job_id });
  }

  return data;
}

export async function updateApplication(id: string, appData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('applications')
    .update(appData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from('job_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTemplate(templateData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('job_templates')
    .insert(templateData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('job_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function checkHealth() {
  const { error } = await supabase.from('jobs').select('id').limit(1);
  if (error && error.code !== 'PGRST116') throw error;
  return true;
}

import { Pool } from 'pg';

let pool: Pool | null = null;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  if (!pool) {
    console.warn("No Postgres connection string found. Raw SQL query cannot run.");
    return [];
  }
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function execute(text: string, params?: any[]) {
  if (!pool) {
    console.warn("No Postgres connection string found. Raw SQL execute cannot run.");
    return 0;
  }
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rowCount;
  } finally {
    client.release();
  }
}
