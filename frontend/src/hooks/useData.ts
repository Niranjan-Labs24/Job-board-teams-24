'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Application {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  resumeUrl?: string;
  linkedIn?: string;
  portfolio?: string;
  coverLetter?: string;
  experience: string;
  status: string;
  rating: number;
  stage: string;
  appliedAt: string;
  notes: Note[];
  ratings: Rating[];
  // Additional fields for UI compatibility
  jobTitle?: string;
  applicantName?: string;
  appliedDate?: string;
  resume?: string;
  daysInStage?: number;
  tags?: string[];
  assignedTo?: string;
  isArchived?: boolean;
}

export interface Note {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  noteType: 'general' | 'phone_screen' | 'interview' | 'reference' | 'other';
  content: string;
  isPinned: boolean;
  visibility: 'private' | 'team';
  createdAt: string;
  canEdit: boolean;
}

export interface Rating {
  id: string;
  applicationId: string;
  category: string;
  score: number;
  maxScore: number;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  createdAt: string;
  comment?: string;
}

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
  benefits?: string[];
  status: string;
  statusChangedAt: string;
  closureReason?: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
  templateId?: string;
  category?: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: Partial<Job>) => {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error('Failed to create job');
    const newJob = await response.json();
    setJobs(prev => [...prev, newJob]);
    return newJob;
  }, []);

  const updateJob = useCallback(async (id: string, updates: Partial<Job>) => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update job');
    const updatedJob = await response.json();
    setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
    return updatedJob;
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete job');
    setJobs(prev => prev.filter(job => job.id !== id));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob, setJobs };
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (jobId?: string) => {
    try {
      setLoading(true);
      const url = jobId ? `/api/applications?jobId=${jobId}` : '/api/applications';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      
      // Transform data for UI compatibility
      const transformedData = data.map((app: Application) => ({
        ...app,
        jobTitle: app.position,
        applicantName: app.name,
        appliedDate: app.appliedAt?.split('T')[0],
        resume: app.resumeUrl,
        daysInStage: Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24)),
      }));
      
      setApplications(transformedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createApplication = useCallback(async (appData: Partial<Application>) => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
    if (!response.ok) throw new Error('Failed to create application');
    const newApp = await response.json();
    setApplications(prev => [...prev, {
      ...newApp,
      jobTitle: newApp.position,
      applicantName: newApp.name,
      appliedDate: newApp.appliedAt?.split('T')[0],
      resume: newApp.resumeUrl,
      daysInStage: 0,
    }]);
    return newApp;
  }, []);

  const updateApplication = useCallback(async (id: string, updates: Partial<Application>) => {
    const response = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update application');
    const updatedApp = await response.json();
    setApplications(prev => prev.map(app => app.id === id ? {
      ...updatedApp,
      jobTitle: updatedApp.position,
      applicantName: updatedApp.name,
      appliedDate: updatedApp.appliedAt?.split('T')[0],
      resume: updatedApp.resumeUrl,
      daysInStage: Math.floor((Date.now() - new Date(updatedApp.appliedAt).getTime()) / (1000 * 60 * 60 * 24)),
    } : app));
    return updatedApp;
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete application');
    setApplications(prev => prev.filter(app => app.id !== id));
  }, []);

  const bulkAction = useCallback(async (applicationIds: string[], action: string, data?: Record<string, unknown>) => {
    const response = await fetch('/api/applications/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationIds, action, data }),
    });
    if (!response.ok) throw new Error('Bulk action failed');
    const result = await response.json();
    // Refresh applications after bulk action
    await fetchApplications();
    return result;
  }, [fetchApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, error, fetchApplications, createApplication, updateApplication, deleteApplication, bulkAction, setApplications };
}
