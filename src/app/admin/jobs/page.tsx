import { getJobs, getTemplates } from '@/lib/db';
import AdminJobsClient from './AdminJobsClient';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminJobsPage() {
  let jobs = [];
  let templates = [];
  let serverError = null;
  let userRole = '';

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (token) {
       const payload = await verifyJWT(token);
       if (payload) {
         userRole = payload.role as string;
       }
    }

    [jobs, templates] = await Promise.all([
      getJobs({ includeArchived: true }),
      getTemplates()
    ]);
  } catch (e) {
    console.error('Error fetching admin data:', e);
    serverError = String(e);
  }
  
  return (
    <AdminJobsClient 
      initialJobs={jobs} 
      initialTemplates={templates}
      serverError={serverError}
      userRole={userRole} 
    />
  );
}
