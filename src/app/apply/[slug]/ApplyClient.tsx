'use client';

import { useRouter } from 'next/navigation';
import { ApplicationForm } from '@/components/ApplicationForm';
import { Job } from '@/components/JobLanding';

interface ApplyClientProps {
  job: Job;
}

export function ApplyClient({ job }: ApplyClientProps) {
  const router = useRouter();

  return (
    <ApplicationForm 
      job={job} 
      isStandalone={true} 
      onBack={() => router.push('/careers')} 
    />
  );
}
