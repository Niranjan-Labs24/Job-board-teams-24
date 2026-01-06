'use client';

import { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { Job } from './JobLanding';
import { ApplicationForm } from './ApplicationForm';

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

export function JobDialog({ job, onClose }: JobDialogProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  const deadline = job.application_deadline || job.applicationDeadline;
  const daysUntil = getDaysUntilDeadline(deadline);
  const approaching = isDeadlineApproaching(deadline);
  const lastDay = isLastDay(deadline);
  const salaryMin = job.salary_min || job.salaryMin;
  const salaryMax = job.salary_max || job.salaryMax;

  if (showApplicationForm) {
    return (
      <ApplicationForm
        job={job}
        onClose={onClose}
        onBack={() => setShowApplicationForm(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {deadline && approaching && (
          <div className={`px-8 py-3 flex items-center gap-2 ${
            lastDay ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {lastDay ? (
              <>
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Last day to apply!</span>
                <span>Applications close at midnight.</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                <span className="font-medium">Closing soon!</span>
                <span>Only {daysUntil} day{daysUntil !== 1 ? 's' : ''} left to apply.</span>
              </>
            )}
          </div>
        )}

        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: job.color }}
            />
            <div>
              <h2 className="mb-2">{job.title}</h2>
              <p className="text-gray-600">
                {job.type} • {job.salaryMin} - {job.salaryMax} • {job.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-8">
          {job.applicationDeadline && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              lastDay ? 'bg-red-50 border border-red-200' : 
              approaching ? 'bg-amber-50 border border-amber-200' : 
              'bg-gray-50 border border-gray-200'
            }`}>
              <Clock className={`w-5 h-5 ${
                lastDay ? 'text-red-600' : 
                approaching ? 'text-amber-600' : 
                'text-gray-500'
              }`} />
              <div>
                <p className={`font-medium ${
                  lastDay ? 'text-red-900' : 
                  approaching ? 'text-amber-900' : 
                  'text-gray-900'
                }`}>
                  Application Deadline
                </p>
                <p className={`text-sm ${
                  lastDay ? 'text-red-700' : 
                  approaching ? 'text-amber-700' : 
                  'text-gray-600'
                }`}>
                  Apply by {formatDeadline(job.applicationDeadline)}
                  {daysUntil !== null && daysUntil >= 0 && (
                    <span className="ml-2">
                      ({daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="mb-4">About the role</h3>
            <p className="text-gray-700">{job.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="mb-4">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="mb-4">Responsibilities</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span className="text-gray-700">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setShowApplicationForm(true)}
            className={`w-full py-4 rounded-lg transition-colors font-medium ${
              lastDay 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {lastDay ? 'Apply Now - Last Day!' : 'Apply for this position'}
          </button>
        </div>
      </div>
    </div>
  );
}
