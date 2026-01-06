'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Users, Plus, Search, Filter, MoreVertical,
  Pause, Play, Archive, Eye, Edit, Trash2, Loader2,
  LogOut, ChevronRight, Clock, AlertCircle, X
} from 'lucide-react';

interface Job {
  id: string;
  slug: string;
  title: string;
  type: string;
  location: string;
  status: 'draft' | 'published' | 'paused' | 'closed' | 'archived';
  applications_count: number;
  application_deadline?: string;
  created_at: string;
  color: string;
}

interface JobFormData {
  title: string;
  type: string;
  location: string;
  salary_min: string;
  salary_max: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  application_deadline: string;
  category: string;
  color: string;
  status: string;
}

const statusConfig = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  published: { label: 'Published', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  paused: { label: 'Paused', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  closed: { label: 'Closed', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  archived: { label: 'Archived', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const colorOptions = [
  '#3B82F6', '#EC4899', '#F97316', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'
];

const initialFormData: JobFormData = {
  title: '',
  type: 'full-time',
  location: '',
  salary_min: '',
  salary_max: '',
  description: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  application_deadline: '',
  category: '',
  color: '#3B82F6',
  status: 'draft',
};

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('includeArchived', 'true');
      
      const response = await fetch(`/api/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
    setActiveMenu(null);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusTabs = [
    { key: 'all', label: 'All Jobs', count: jobs.length },
    { key: 'published', label: 'Published', count: jobs.filter(j => j.status === 'published').length },
    { key: 'draft', label: 'Drafts', count: jobs.filter(j => j.status === 'draft').length },
    { key: 'paused', label: 'Paused', count: jobs.filter(j => j.status === 'paused').length },
    { key: 'closed', label: 'Closed', count: jobs.filter(j => j.status === 'closed').length },
  ];

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-semibold">Job Management</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                data-testid="create-job-btn"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </button>
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Jobs</p>
                <p className="text-2xl font-semibold mt-1">{jobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Jobs</p>
                <p className="text-2xl font-semibold mt-1">{jobs.filter(j => j.status === 'published').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Applications</p>
                <p className="text-2xl font-semibold mt-1">{jobs.reduce((sum, j) => sum + j.applications_count, 0)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Closing Soon</p>
                <p className="text-2xl font-semibold mt-1">
                  {jobs.filter(j => {
                    const days = getDaysUntilDeadline(j.application_deadline);
                    return days !== null && days >= 0 && days <= 7;
                  }).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-6">
            <div className="flex items-center gap-1">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    statusFilter === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    statusFilter === tab.key ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                data-testid="search-jobs-input"
              />
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.map(job => {
                const days = getDaysUntilDeadline(job.application_deadline);
                const isClosingSoon = days !== null && days >= 0 && days <= 7;
                const config = statusConfig[job.status];
                
                return (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/jobs/${job.id}`)}
                    data-testid={`job-row-${job.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: job.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.type} • {job.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{job.applications_count}</span>
                        <span className="text-gray-500">applicants</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.application_deadline ? (
                        <div className={`flex items-center gap-1.5 ${isClosingSoon ? 'text-amber-600' : 'text-gray-500'}`}>
                          {isClosingSoon && <AlertCircle className="w-4 h-4" />}
                          <span className="text-sm">
                            {new Date(job.application_deadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {days !== null && days >= 0 && (
                            <span className="text-xs text-gray-400">
                              ({days === 0 ? 'Today' : `${days}d left`})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No deadline</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          data-testid={`job-menu-${job.id}`}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {activeMenu === job.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button
                              onClick={() => router.push(`/admin/jobs/${job.id}`)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Applications
                            </button>
                            <button
                              onClick={() => router.push(`/careers/${job.slug}`)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Job Page
                            </button>
                            <hr className="my-1" />
                            {job.status === 'published' && (
                              <button
                                onClick={() => handleStatusChange(job.id, 'paused')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Pause className="w-4 h-4" />
                                Pause Job
                              </button>
                            )}
                            {job.status === 'paused' && (
                              <button
                                onClick={() => handleStatusChange(job.id, 'published')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Resume Job
                              </button>
                            )}
                            {job.status === 'draft' && (
                              <button
                                onClick={() => handleStatusChange(job.id, 'published')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Publish Job
                              </button>
                            )}
                            {job.status !== 'closed' && job.status !== 'archived' && (
                              <button
                                onClick={() => handleStatusChange(job.id, 'closed')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                              >
                                <Archive className="w-4 h-4" />
                                Close Job
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredJobs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No jobs found. Create your first job to get started.
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
