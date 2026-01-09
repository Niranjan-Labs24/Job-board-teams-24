import { Metadata } from 'next';
import { getJobBySlug } from '@/lib/db';
import JobPageClient from './JobPageClient';

interface Job {
  id: string;
  slug: string;
  title: string;
  type: string;
  salary_min: string;
  salary_max: string;
  location: string;
  color: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  meta_title?: string;
  meta_description?: string;
  application_deadline?: string;
  category?: string;
}

async function getJob(slug: string): Promise<Job | null> {
  try {
    const job = await getJobBySlug(slug);
    return job as Job | null;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  
  if (!job) {
    return {
      title: 'Job Not Found | Teams 24 Careers',
    };
  }

  const title = job.meta_title || `${job.title} | Teams 24 Careers`;
  const description = job.meta_description || job.description?.substring(0, 160) || `Apply for ${job.title} at Teams 24`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Teams 24 Careers',
      url: `/careers/${job.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'application-name': 'Teams 24 Careers',
    },
  };
}

// Generate JSON-LD structured data
function generateJobPostingLD(job: Job) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: new Date().toISOString(),
    validThrough: job.application_deadline ? new Date(job.application_deadline).toISOString() : undefined,
    employmentType: job.type === 'full-time' ? 'FULL_TIME' : 
                    job.type === 'part-time' ? 'PART_TIME' : 
                    job.type === 'contract' ? 'CONTRACTOR' : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Teams 24',
      sameAs: 'https://teams24.com',
      logo: 'https://teams24.com/logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: parseInt(job.salary_min?.replace(/[^0-9]/g, '') || '0') * 1000,
        maxValue: parseInt(job.salary_max?.replace(/[^0-9]/g, '') || '0') * 1000,
        unitText: 'YEAR',
      },
    },
    responsibilities: job.responsibilities?.join('. '),
    qualifications: job.requirements?.join('. '),
    jobBenefits: job.benefits?.join(', '),
    industry: job.category || 'Technology',
  };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">This position may have been filled or removed.</p>
          <a href="/careers" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
            ← View all open positions
          </a>
        </div>
      </div>
    );
  }

  const jsonLd = generateJobPostingLD(job);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobPageClient job={job} />
    </>
  );
}
