import { getApplications, getJobs } from '@/lib/db';
import CandidatesClient from './CandidatesClient';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCandidatesPage() {
  let applications: any[] = [];
  let jobs: any[] = [];
  let serverError: string | null = null;
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

    [applications, jobs] = await Promise.all([
      getApplications({ jobId: 'all' }),
      getJobs({ includeArchived: true })
    ]);
  } catch (e) {
    console.error('Error fetching candidates data:', e);
    serverError = String(e);
  }
  
  return (
    <CandidatesClient 
      initialApplications={applications} 
      jobs={jobs}
      serverError={serverError}
      userRole={userRole} 
    />
  );
}
