'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, AlertCircle, Loader2, MapPin, Briefcase, DollarSign } from 'lucide-react';

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
  category?: string;
  application_deadline?: string;
}

const getDaysUntilDeadline = (deadline?: string) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const isDeadlineApproaching = (deadline?: string) => {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days >= 0 && days <= 3;
};

const isLastDay = (deadline?: string) => {
  const days = getDaysUntilDeadline(deadline);
  return days === 0;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs?status=published');
        if (response.ok) {
          const data = await response.json();
          // Filter out jobs with passed deadlines
          const activeJobs = data.filter((job: Job) => {
            if (!job.application_deadline) return true;
            const days = getDaysUntilDeadline(job.application_deadline);
            return days === null || days >= 0;
          });
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const categories = ['all', ...new Set(jobs.map(j => j.category).filter(Boolean))];
  const filteredJobs = categoryFilter === 'all' 
    ? jobs 
    : jobs.filter(j => j.category === categoryFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h1 className="text-5xl font-bold mb-4">Join Teams 24</h1>
          <p className="text-xl text-indigo-100 max-w-2xl">
            Build the future with us. We&apos;re looking for talented individuals who are passionate 
            about making an impact and pushing boundaries.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-200" />
              <span>{jobs.length} Open Positions</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-200" />
              <span>Remote & On-site</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'All Departments' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-4">
          {filteredJobs.map((job) => {
            const daysUntil = getDaysUntilDeadline(job.application_deadline);
            const approaching = isDeadlineApproaching(job.application_deadline);
            const lastDay = isLastDay(job.application_deadline);

            return (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className={`block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all group ${
                  approaching ? 'ring-2 ring-amber-200' : ''
                }`}
                data-testid={`job-card-${job.slug}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: job.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h2>
                        {lastDay && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Last day!
                          </span>
                        )}
                        {!lastDay && approaching && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Closing soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary_min} - {job.salary_max}
                        </span>
                      </div>
                      {job.application_deadline && (
                        <p className={`text-sm mt-2 ${lastDay ? 'text-red-600' : approaching ? 'text-amber-600' : 'text-gray-500'}`}>
                          Apply by {new Date(job.application_deadline).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {daysUntil !== null && daysUntil >= 0 && (
                            <span className="ml-1">
                              ({daysUntil === 0 ? 'Today!' : `${daysUntil} days left`})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions</h3>
            <p className="text-gray-500">Check back soon for new opportunities!</p>
          </div>
        )}
      </div>

      {/* Company Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4">Teams 24</h3>
              <p className="text-gray-400 max-w-md">
                Building innovative solutions that transform how teams work together. 
                Join us in shaping the future of collaboration.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2026 Teams 24. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
