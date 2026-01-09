'use client';

import { useRouter } from 'next/navigation';
import { AdminLogin } from '@/components/AdminLogin';

export default function AdminPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/admin/jobs');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <AdminLogin 
        onClose={() => router.push('/careers')} 
        onLogin={handleLogin} 
        isPage={true}
      />
    </div>
  );
}
