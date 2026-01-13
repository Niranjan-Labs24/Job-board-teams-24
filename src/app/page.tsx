'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, MapPin, Briefcase, Loader2, DollarSign, IndianRupee, Euro } from 'lucide-react';

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
  currency?: string;
  requirements: string[];
  responsibilities: string[];
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

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');


  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs?status=published');
        if (response.ok) {
          const data = await response.json();
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

  const categories = ['all', ...Array.from(new Set(jobs.map(j => j.category).filter(Boolean)))];
  const filteredJobs = categoryFilter === 'all' 
    ? jobs 
    : jobs.filter(j => j.category === categoryFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Hero Section */}
      <div className="bg-black text-white relative overflow-hidden py-8 md:py-10 min-h-[20vh] md:min-h-[25vh] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-indigo-500 rounded-full blur-[120px]" />
          <div className="bottom-0 -right-1/4 w-1/2 h-full bg-purple-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <img 
              src="/logo copy.png" 
              alt="Teams24 Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
            <span className="text-xl md:text-2xl font-black text-white tracking-tight">Teams24</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Build the next generation <span className="text-gray-500">of software.</span>
            </h1>
            <p className="text-base text-gray-400 font-medium leading-relaxed mb-6">
              We&apos;re a team of designers, engineers, and visionaries working together 
              to transform how teams collaborate and build the future. Join us.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">{jobs.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Open Roles</span>
              </div>
              <div className="w-px h-8 bg-gray-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">100%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Remote-first</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat as string)}
                  className={`whitespace-nowrap px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                    categoryFilter === cat
                      ? 'bg-black text-white shadow-xl shadow-black/10'
                      : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? 'All Roles' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-gray-900 mb-12 tracking-tight">Open positions</h2>
        <div className="grid gap-0">
          {filteredJobs.map((job) => {
            const daysUntil = getDaysUntilDeadline(job.application_deadline);
            const approaching = isDeadlineApproaching(job.application_deadline);
            const lastDay = isLastDay(job.application_deadline);

            return (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className="group relative bg-[#fafafa] border-b border-gray-200 p-5 md:p-8 hover:bg-gray-100/50 transition-all duration-300 flex items-center justify-between gap-4 md:gap-8"
              >
                <div className="flex items-center gap-4 md:gap-6 relative z-10 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 duration-500"
                    style={{ backgroundColor: job.color }}
                  >
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight transition-colors group-hover:text-indigo-600 truncate">
                        {job.title}
                      </h2>
                      <div className="flex gap-1">
                        {lastDay && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
                            Last Day
                          </span>
                        )}
                        {!lastDay && approaching && (
                          <span className="px-1.5 py-0.5 bg-amber-400 text-amber-900 text-[8px] font-black uppercase tracking-widest rounded-full">
                            Closing Soon
                          </span>
                        )}
                      </div>
                    </div>
                    
                     <div className="flex flex-wrap items-center gap-1.5 text-gray-400 font-medium text-[10px] md:text-xs">
                      <span className="truncate">{job.type}</span>
                      <span>•</span>
                      <span className="truncate">{job.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {job.currency === 'INR' ? (
                          <IndianRupee className="w-2.5 h-2.5" />
                        ) : job.currency === 'EUR' ? (
                          <Euro className="w-2.5 h-2.5" />
                        ) : (
                          <DollarSign className="w-2.5 h-2.5" />
                        )}
                        {job.currency === 'INR' ? '₹' : job.currency === 'EUR' ? '€' : '$'}{job.salary_min} - {job.currency === 'INR' ? '₹' : job.currency === 'EUR' ? '€' : '$'}{job.salary_max}
                      </span>
                    </div>

                    {job.application_deadline && (
                      <p className={`text-[9px] md:text-[11px] font-bold mt-1 uppercase tracking-widest flex items-center gap-1.5 ${lastDay ? 'text-red-600' : approaching ? 'text-amber-600' : 'text-gray-400'}`}>
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        Apply by {new Date(job.application_deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition-all duration-300 transform group-hover:rotate-45 shadow-lg shadow-black/10">
                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
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

      {/* Results Count & Watermark */}
      <div className="max-w-6xl mx-auto px-6 pb-64">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Showing {filteredJobs.length} results
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen max-w-[90rem] overflow-hidden pointer-events-none">
        <div className="w-full h-[7.5rem] sm:h-[9.375rem] md:h-[12.5rem] lg:h-[15.625rem] xl:h-[21.875rem] flex items-end justify-center select-none opacity-10">
          <p
            className="font-normal text-center whitespace-nowrap w-full px-4"
            style={{
              fontFamily: "Dyson Sans Modern",
              fontWeight: 400,
              fontSize: "clamp(5rem, 25vw, 25rem)",
              lineHeight: "0.6",
              color: "#131313",
              transform: "translateY(15%)",
              minWidth: "max-content",
            }}
          >
            Teams24
          </p>
        </div>
      </div>

    </div>
  );
}
