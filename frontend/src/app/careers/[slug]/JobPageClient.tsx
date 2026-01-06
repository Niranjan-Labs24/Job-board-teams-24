'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Briefcase, DollarSign, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';

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

export default function JobPageClient({ job }: JobPageClientProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
    experience: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const daysUntil = getDaysUntilDeadline(job.application_deadline);
  const approaching = isDeadlineApproaching(job.application_deadline);
  const lastDay = isLastDay(job.application_deadline);
  const deadlinePassed = isDeadlinePassed(job.application_deadline);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: job.title,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          cover_letter: formData.coverLetter,
          experience: formData.experience,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to {job.title}. We&apos;ll review your application and get back to you soon.
          </p>
          <Link
            href="/careers"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View More Positions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Deadline Banner */}
      {job.application_deadline && approaching && !deadlinePassed && (
        <div className={`${lastDay ? 'bg-red-600' : 'bg-amber-500'} text-white py-3`}>
          <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-2">
            {lastDay ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <span className="font-medium">
              {lastDay 
                ? 'Last day to apply! Applications close at midnight.'
                : `Only ${daysUntil} days left to apply`
              }
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Positions
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex-shrink-0"
                style={{ backgroundColor: job.color }}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    ${job.salary_min} - ${job.salary_max}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareButton 
                title={`${job.title} at Teams 24`}
                url={`/careers/${job.slug}`}
                description={job.description?.substring(0, 200)}
              />
              {!deadlinePassed && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  data-testid="apply-now-btn"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-8">
            {/* Deadline Info */}
            {job.application_deadline && (
              <div className={`p-4 rounded-xl border ${
                deadlinePassed 
                  ? 'bg-gray-50 border-gray-200'
                  : lastDay 
                    ? 'bg-red-50 border-red-200' 
                    : approaching 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${
                    deadlinePassed ? 'text-gray-400' : lastDay ? 'text-red-600' : approaching ? 'text-amber-600' : 'text-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {deadlinePassed ? 'Applications Closed' : 'Application Deadline'}
                    </p>
                    <p className={`text-sm ${
                      deadlinePassed ? 'text-gray-500' : lastDay ? 'text-red-600' : approaching ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {new Date(job.application_deadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {!deadlinePassed && daysUntil !== null && (
                        <span className="ml-2">
                          ({daysUntil === 0 ? 'Today!' : `${daysUntil} days left`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Role</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </section>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="grid grid-cols-2 gap-3">
                  {job.benefits.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Apply Card */}
              {!deadlinePassed && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Interested?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Submit your application and join our team.
                  </p>
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Apply for This Position
                  </button>
                </div>
              )}

              {/* Company Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">About Teams 24</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We&apos;re a fast-growing company building innovative solutions 
                  that transform how teams collaborate and work together.
                </p>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">
                  Learn more about us →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Apply for {job.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Fill out the form below to submit your application</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="application-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="application-email-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.portfolio}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="text"
                  placeholder="e.g., 5 years"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                <textarea
                  rows={4}
                  placeholder="Tell us why you're interested in this role..."
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="submit-application-btn"
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Teams 24</h3>
              <p className="text-gray-400 text-sm mt-1">Building the future of work</p>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="/careers" className="hover:text-white transition-colors">Careers</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
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
