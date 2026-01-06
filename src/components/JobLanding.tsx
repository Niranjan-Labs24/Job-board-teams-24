'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Lock, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { JobDialog } from './JobDialog';

export interface Job {
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
  application_deadline?: string;
  status?: 'draft' | 'published' | 'paused' | 'closed' | 'archived';
  // Legacy field mapping for compatibility
  salaryMin?: string;
  salaryMax?: string;
  applicationDeadline?: string;
}

interface JobLandingProps {
  onAdminClick: () => void;
}

const getDaysUntilDeadline = (deadline?: string) => {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const isDeadlineApproaching = (deadline?: string) => {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days >= 0 && days <= 3;
};

const isLastDay = (deadline?: string) => {
  const days = getDaysUntilDeadline(deadline);
  return days === 0;
};

const isDeadlinePassed = (deadline?: string) => {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days < 0;
};

const formatDeadline = (deadline?: string) => {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export function JobLanding({ onAdminClick }: JobLandingProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setError(null);
        const response = await fetch('/api/jobs');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          console.error('Unexpected response format:', data);
          setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(String(err));
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const activeJobs = jobs.filter(job => {
    if (job.status && job.status !== 'published') return false;
    const deadline = job.application_deadline || job.applicationDeadline;
    if (deadline && isDeadlinePassed(deadline)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-gray-600">Teams 24 Careers</h2>
          <button
            onClick={onAdminClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Admin Login"
          >
            <Lock className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="h-px bg-gray-200 mb-12" />

        <div className="flex justify-between items-center mb-12">
          <h1>Open positions</h1>
          <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            View all openings
          </button>
        </div>

        <div className="space-y-6">
          {activeJobs.map((job) => {
            const deadline = job.application_deadline || job.applicationDeadline;
            const daysUntil = getDaysUntilDeadline(deadline);
            const approaching = isDeadlineApproaching(deadline);
            const lastDay = isLastDay(deadline);
            const salaryMin = job.salary_min || job.salaryMin;
            const salaryMax = job.salary_max || job.salaryMax;
            
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`flex items-center gap-4 py-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors ${
                  approaching ? 'bg-amber-50/50 hover:bg-amber-50' : ''
                }`}
                data-testid={`job-card-${job.id}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: job.color }}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3>{job.title}</h3>
                    {lastDay && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Last day to apply!
                      </span>
                    )}
                    {!lastDay && approaching && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Closing soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {job.type} • ${salaryMin} - ${salaryMax} • {job.location}
                  </p>
                  {deadline && (
                    <p className={`text-sm mt-1 flex items-center gap-1 ${
                      lastDay ? 'text-red-600 font-medium' : 
                      approaching ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      Apply by {formatDeadline(deadline)}
                      {daysUntil !== null && daysUntil > 0 && daysUntil <= 7 && (
                        <span className="ml-1">
                          ({daysUntil} day{daysUntil !== 1 ? 's' : ''} left)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            );
          })}
          
          {activeJobs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No open positions at the moment. Check back soon!
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <JobDialog job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
