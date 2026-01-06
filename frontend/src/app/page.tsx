'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobLanding } from '@/components/JobLanding';
import { AdminLogin } from '@/components/AdminLogin';

export default function Home() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleAdminLogin = () => {
    // Redirect to new job-centric admin dashboard
    router.push('/admin/jobs');
  };

  if (showAdminLogin) {
    return (
      <AdminLogin
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
      />
    );
  }

  return <JobLanding onAdminClick={() => setShowAdminLogin(true)} />;
}
