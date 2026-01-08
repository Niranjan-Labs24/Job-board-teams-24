import { getJobBySlug } from '@/lib/db';
import { ApplicationForm } from '@/components/ApplicationForm';
import Link from 'next/link';

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The position you're looking for doesn't exist or has been closed.</p>
          <Link 
            href="/careers" 
            className="inline-block px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
          >
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Map legacy fields if necessary
  const formattedJob = {
    ...job,
    salary_min: job.salary_min || job.salaryMin,
    salary_max: job.salary_max || job.salaryMax,
    application_deadline: job.application_deadline || job.applicationDeadline,
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <ApplicationForm job={formattedJob} isStandalone={true} />
    </div>
  );
}
