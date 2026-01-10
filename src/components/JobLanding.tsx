'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Lock, Clock, AlertCircle, Loader2, Briefcase, MapPin, DollarSign, IndianRupee, Euro } from 'lucide-react';
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
  currency?: string;
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Teams 24 Opportunities</h2>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">Open positions</h1>
          </div>
          <button
            onClick={onAdminClick}
            className="p-3 hover:bg-white hover:shadow-xl hover:shadow-black/5 rounded-2xl transition-all"
            title="Admin Login"
          >
            <Lock className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="h-px bg-gray-100 mt-8 mb-16" />

        <div className="grid gap-6">
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
                className="group relative bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              >
                <div 
                  onClick={() => setSelectedJob(job)}
                  className="absolute inset-0 z-20 cursor-pointer" 
                />
                
                <div className="flex items-start gap-6 relative z-10 flex-1">
                  <div
                    className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-black/5 transition-transform group-hover:scale-110 duration-500"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.title.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight transition-colors group-hover:text-indigo-600">
                        {job.title}
                      </h3>
                      {lastDay && (
                        <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                          Last Day
                        </span>
                      )}
                      {!lastDay && approaching && (
                        <span className="px-3 py-1 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest rounded-full">
                          Closing Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2">
                        {job.currency === 'INR' ? (
                          <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                        ) : job.currency === 'EUR' ? (
                          <Euro className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                        )}
                        {job.currency === 'INR' ? '₹' : job.currency === 'EUR' ? '€' : '$'}{salaryMin} - {job.currency === 'INR' ? '₹' : job.currency === 'EUR' ? '€' : '$'}{salaryMax}
                      </span>
                    </div>

                    {deadline && (
                      <p className={`text-[11px] font-bold mt-4 uppercase tracking-widest flex items-center gap-2 ${
                        lastDay ? 'text-red-600' : 
                        approaching ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        Apply by {formatDeadline(deadline)}
                        {daysUntil !== null && daysUntil > 0 && daysUntil <= 7 && (
                          <span className="opacity-60">
                            ({daysUntil}d left)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto relative z-30">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 md:flex-none px-8 py-3 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all font-black uppercase tracking-widest text-[11px] text-center"
                  >
                    Details
                  </button>
                  <Link
                    href={`/apply/${job.slug}`}
                    className="flex-1 md:flex-none px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all font-black uppercase tracking-widest text-[11px] text-center shadow-lg shadow-black/10 active:scale-[0.98]"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {activeJobs.length === 0 && !error && (
          <div className="py-12 text-center text-gray-500 text-lg font-medium">
            No open positions at the moment. Check back soon!
          </div>
        )}
        
        {error && (
          <div className="py-12 text-center bg-red-50 rounded-3xl border border-red-100 p-12">
            <p className="text-red-600 font-black uppercase tracking-widest text-xs mb-4">Unable to load positions</p>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDialog job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
