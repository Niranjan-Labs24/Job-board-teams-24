'use client';

import { X, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Job } from './JobLanding';

interface JobDialogProps {
  job: Job;
  onClose: () => void;
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

const formatDeadline = (deadline?: string) => {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
};

import { useState } from 'react';

export function JobDialog({ job, onClose }: JobDialogProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const deadline = job.application_deadline || job.applicationDeadline;
  const daysUntil = getDaysUntilDeadline(deadline);
  const approaching = isDeadlineApproaching(deadline);
  const lastDay = isLastDay(deadline);
  const salaryMin = job.salary_min || job.salaryMin;
  const salaryMax = job.salary_max || job.salaryMax;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all animate-in fade-in zoom-in duration-300">
        {deadline && approaching && (
          <div className={`px-8 py-3 flex items-center gap-2 ${
            lastDay ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900 font-bold'
          }`}>
            {lastDay ? (
              <>
                <AlertCircle className="w-5 h-5 animate-pulse" />
                <span className="font-bold">Last day to apply!</span>
                <span className="opacity-90">Applications close at midnight.</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                <span className="font-extrabold uppercase tracking-tight">Closing soon!</span>
                <span className="opacity-80 font-medium">Only {daysUntil} day{daysUntil !== 1 ? 's' : ''} left to apply.</span>
              </>
            )}
          </div>
        )}

        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-start z-10">
          <div className="flex items-start gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex-shrink-0 shadow-lg shadow-black/5"
              style={{ backgroundColor: job.color }}
            />
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-1">{job.title}</h2>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">
                {job.type} • ${salaryMin} - ${salaryMax} • {job.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all hover:rotate-90 duration-300"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="px-8 py-10">
          {deadline && (
            <div className={`mb-10 p-5 rounded-2xl flex items-center gap-4 transition-all ${
              lastDay ? 'bg-red-50 border border-red-100' : 
              approaching ? 'bg-amber-50 border border-amber-100' : 
              'bg-gray-50 border border-gray-100 hover:border-gray-200'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                lastDay ? 'bg-red-100 text-red-600' : 
                approaching ? 'bg-amber-100 text-amber-600' : 
                'bg-white text-gray-400 shadow-sm'
              }`}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${
                  lastDay ? 'text-red-900' : 
                  approaching ? 'text-amber-900' : 
                  'text-gray-400'
                }`}>
                  Application Deadline
                </p>
                <p className={`text-xl font-bold ${
                  lastDay ? 'text-red-700' : 
                  approaching ? 'text-amber-700' : 
                  'text-gray-900'
                }`}>
                  {formatDeadline(deadline)}
                  {daysUntil !== null && daysUntil >= 0 && (
                    <span className="ml-2 opacity-50 font-normal">
                      ({daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">About the role</h3>
            <p className="text-gray-700 text-lg leading-relaxed font-medium">{job.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-5">Requirements</h3>
              <ul className="space-y-4">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="w-2 h-2 rounded-full bg-black mt-2.5 flex-shrink-0 opacity-20" />
                    <span className="text-gray-700 font-bold leading-snug">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-5">Responsibilities</h3>
              <ul className="space-y-4">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="w-2 h-2 rounded-full bg-black mt-2.5 flex-shrink-0 opacity-20" />
                    <span className="text-gray-700 font-bold leading-snug">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link
            href={`/apply/${job.slug}`}
            onClick={() => setIsNavigating(true)}
            className={`block w-full py-6 rounded-3xl transition-all font-black text-center text-xl shadow-xl shadow-black/10 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 ${
              lastDay 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-black text-white hover:bg-gray-800'
            } ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Preparing...
              </>
            ) : (
              lastDay ? 'Apply Now - Last Day!' : 'Apply for this position'
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
