'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Lock, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { JobDialog } from './JobDialog';

export interface Job {
  id: string;
  title: string;
  type: string;
  salaryMin: string;
  salaryMax: string;
  location: string;
  color: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  applicationDeadline?: string;
  status?: 'draft' | 'published' | 'paused' | 'closed' | 'archived';
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

  const activeJobs = mockJobs.filter(job => {
    if (job.status && job.status !== 'published') return false;
    if (job.applicationDeadline && isDeadlinePassed(job.applicationDeadline)) return false;
    return true;
  });

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
            const daysUntil = getDaysUntilDeadline(job.applicationDeadline);
            const approaching = isDeadlineApproaching(job.applicationDeadline);
            const lastDay = isLastDay(job.applicationDeadline);
            
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
                    {job.type} • {job.salaryMin} - {job.salaryMax} • {job.location}
                  </p>
                  {job.applicationDeadline && (
                    <p className={`text-sm mt-1 flex items-center gap-1 ${
                      lastDay ? 'text-red-600 font-medium' : 
                      approaching ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      Apply by {formatDeadline(job.applicationDeadline)}
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
