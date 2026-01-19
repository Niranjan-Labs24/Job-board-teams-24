import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simplified query functions that use Supabase directly
export async function getJobs(options?: { status?: string; includeArchived?: boolean }) {
  let query = supabase.from('jobs').select('*');

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (!options?.includeArchived) {
    query = query.neq('status', 'archived');
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
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

export async function createJob(jobData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJob(id: string, jobData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('jobs')
    .update(jobData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getApplications(options?: { jobId?: string; status?: string; stage?: string }) {
  let query = supabase.from('applications').select(`
    *,
    jobs!inner(title, slug)
  `);

  if (options?.jobId) {
    query = query.eq('job_id', options.jobId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.stage) {
    query = query.eq('stage', options.stage);
  }

  query = query.eq('is_archived', false);
  query = query.order('applied_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Transform to match expected format
  return (data || []).map((app: Record<string, unknown>) => ({
    ...app,
    job_title: (app.jobs as Record<string, unknown>)?.title,
    job_slug: (app.jobs as Record<string, unknown>)?.slug,
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

  // Update applications count
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

// Health check
export async function checkHealth() {
  const { error } = await supabase.from('jobs').select('id').limit(1);
  if (error && error.code !== 'PGRST116') throw error;
  return true;
}

// Generic Query/Execute for raw SQL (using pg if available or Supabase RPC)
// Since we are in a serverless environment with Supabase, raw SQL via 'pg' is possible if connection string is direct.
import { Pool } from 'pg';

let pool: Pool | null = null;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase in many cases
  });
}

export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  // Fallback: If no direct PG connection, try RPC if function exists (advanced)
  // For now, assume PG connection is available or this will fail.
  // Ideally we should use Supabase Client completely, but these routes were written with 'execute' style.
  if (!pool) {
    // If we don't have a pool, we can't run raw SQL easily without RPC.
    // Let's warn and return empty or throw.
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
