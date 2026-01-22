'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Briefcase, DollarSign, IndianRupee, Euro, AlertCircle, CheckCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { ApplicationForm } from '@/components/ApplicationForm';

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
  application_deadline?: string;
  category?: string;
  currency?: string;
}

interface JobPageClientProps {
  job: Job;
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

const isDeadlinePassed = (deadline?: string) => {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days < 0;
};

import { useState } from 'react';

export default function JobPageClient({ job }: JobPageClientProps) {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const daysUntil = getDaysUntilDeadline(job.application_deadline);
  const approaching = isDeadlineApproaching(job.application_deadline);
  const lastDay = isLastDay(job.application_deadline);
  const deadlinePassed = isDeadlinePassed(job.application_deadline);

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Deadline Banner */}
      {job.application_deadline && approaching && !deadlinePassed && (
        <div className={`${lastDay ? 'bg-red-600' : 'bg-amber-500'} text-white py-4 shadow-lg animate-in slide-in-from-top duration-500`}>
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-3">
            {lastDay ? <AlertCircle className="w-6 h-6 animate-pulse" /> : <Clock className="w-6 h-6" />}
            <span className="font-black uppercase tracking-wider text-sm">
              {lastDay 
                ? 'Final call! Applications close at midnight tonight.'
                : `Hurry! Only ${daysUntil} days remaining to apply`
              }
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            href="/"
            onClick={() => setIsNavigating('back')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-all font-bold uppercase tracking-widest text-xs group disabled:opacity-70"
          >
            {isNavigating === 'back' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            )}
            {isNavigating === 'back' ? 'Loading...' : 'Back to Positions'}
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div
                className="w-20 h-20 rounded-full flex-shrink-0 shadow-2xl shadow-black/5 flex items-center justify-center text-white text-2xl font-black"
                style={{ backgroundColor: job.color }}
              >
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-500 font-bold uppercase tracking-widest text-xs">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    {job.currency === 'INR' ? (
                      <IndianRupee className="w-4 h-4 text-green-500" />
                    ) : job.currency === 'EUR' ? (
                      <Euro className="w-4 h-4 text-green-500" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-green-500" />
                    )}
                    {job.currency === 'INR' ? '₹' : job.currency === 'EUR' ? '€' : '$'}{job.salary_min} - {job.currency === 'INR' ? '₹' : job.currency === 'EUR' ? '€' : '$'}{job.salary_max}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <ShareButton 
                title={`${job.title} at Teams 24`}
                url={`/${job.slug}`}
                description={job.description?.substring(0, 200)}
              />
              {!deadlinePassed && (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="flex-1 md:flex-none px-10 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all font-black shadow-xl shadow-black/10 text-center active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                  data-testid="apply-now-btn"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 pb-64">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Deadline Info */}
            {job.application_deadline && (
              <div className={`p-6 rounded-3xl border transition-all ${
                deadlinePassed 
                  ? 'bg-gray-50 border-gray-100'
                  : lastDay 
                    ? 'bg-red-50 border-red-100 shadow-lg shadow-red-100/50' 
                    : approaching 
                      ? 'bg-amber-50 border-amber-100 shadow-lg shadow-amber-100/50' 
                      : 'bg-white border-gray-100 shadow-sm'
              }`}>
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    deadlinePassed ? 'bg-gray-100 text-gray-400' : lastDay ? 'bg-red-100 text-red-600' : approaching ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                      deadlinePassed ? 'text-gray-400' : lastDay ? 'text-red-900' : approaching ? 'text-amber-900' : 'text-indigo-900'
                    }`}>
                      {deadlinePassed ? 'Applications Closed' : 'Submission Deadline'}
                    </p>
                    <p className={`text-xl font-bold ${
                      deadlinePassed ? 'text-gray-400' : lastDay ? 'text-red-700' : approaching ? 'text-amber-700' : 'text-gray-900'
                    }`}>
                      {new Date(job.application_deadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {!deadlinePassed && daysUntil !== null && (
                        <span className="ml-3 opacity-50 font-normal text-base">
                          ({daysUntil === 0 ? 'Last day!' : `${daysUntil} days left`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <section className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-6">About This Role</h2>
              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line font-medium">{job.description}</div>
            </section>

            {/* Responsibilities & Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Responsibilities</h2>
                  <ul className="space-y-4">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0 opacity-40" />
                        <span className="text-gray-700 text-base font-bold leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Requirements</h2>
                  <ul className="space-y-4">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0 opacity-40" />
                        <span className="text-gray-700 text-base font-bold leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Perks & Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.benefits.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-5 bg-green-50/50 rounded-2xl border border-green-100 transition-all hover:bg-green-50 group">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-gray-800 font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 space-y-8">
              {/* Apply Card */}
              {!deadlinePassed && (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-black/5">
                  <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Ready to join us?</h3>
                  <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    We&apos;re excited to hear from you. Take the next step in your career today.
                  </p>
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="block w-full px-4 py-5 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all font-black text-center shadow-lg shadow-black/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    Apply for Position
                  </button>
                </div>
              )}

              {/* Company Info - Commented Out */}
              {/* <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                <h3 className="text-2xl font-black mb-4 tracking-tight">About Teams 24</h3>
                <p className="text-indigo-100 font-medium mb-6 leading-relaxed">
                  We&apos;re building the next generation of collaboration tools. Join a team that values innovation, speed, and design.
                </p>
                <a href="#" className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                  Our Story
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Watermark */}
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

      {showApplyForm && (
        <ApplicationForm 
          job={job} 
          onClose={() => setShowApplyForm(false)} 
        />
      )}
    </div>
  );
}
