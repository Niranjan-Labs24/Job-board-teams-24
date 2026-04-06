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
  let userId = '';

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (token) {
       const payload = await verifyJWT(token);
       if (payload) {
         userRole = payload.role as string;
         userId = payload.userId as string;
       }
    }

    [jobs, templates] = await Promise.all([
      getJobs({ 
        includeArchived: true,
        userId,
        userRole
      }),
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
      userId={userId}
    />
  );
}
