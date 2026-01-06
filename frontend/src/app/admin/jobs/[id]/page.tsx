'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Users, Search, Filter, LayoutGrid, Table as TableIcon,
  Star, Mail, FileText, Eye, MoreVertical, ChevronRight, Loader2,
  CheckSquare, Square, Clock, Edit, ExternalLink
} from 'lucide-react';

interface Job {
  id: string;
  slug: string;
  title: string;
  type: string;
  location: string;
  status: string;
  color: string;
  applications_count: number;
  salary_min: string;
  salary_max: string;
  application_deadline?: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: string;
  stage: string;
  rating: number;
  applied_at: string;
  linkedin?: string;
  portfolio?: string;
  resume_url?: string;
}

const stageConfig: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: 'New', bg: 'bg-blue-100', text: 'text-blue-700' },
  screening: { label: 'Screening', bg: 'bg-purple-100', text: 'text-purple-700' },
  interview_scheduled: { label: 'Interview Scheduled', bg: 'bg-amber-100', text: 'text-amber-700' },
  interview_complete: { label: 'Interview Complete', bg: 'bg-teal-100', text: 'text-teal-700' },
  offer_pending: { label: 'Offer Pending', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  hired: { label: 'Hired', bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700' },
  on_hold: { label: 'On Hold', bg: 'bg-gray-100', text: 'text-gray-700' },
};

const stages = ['new', 'screening', 'interview_scheduled', 'interview_complete', 'offer_pending', 'hired'];

export default function JobApplicationsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`/api/jobs/${id}`),
        fetch(`/api/applications?jobId=${id}`),
      ]);
      
      if (jobRes.ok) setJob(await jobRes.json());
      if (appsRes.ok) setApplications(await appsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId: string, newStage: string) => {
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage, status: newStage }),
      });
      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === appId ? { ...app, stage: newStage, status: newStage } : app
        ));
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    }
    setActiveMenu(null);
  };

  const toggleSelection = (appId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAppsByStage = (stage: string) => filteredApps.filter(app => app.stage === stage);

  const renderStars = (rating: number | string | null | undefined) => {
    const numRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.round(numRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatRating = (rating: number | string | null | undefined): string => {
    const numRating = Number(rating) || 0;
    return numRating.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Job not found</p>
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
              <button
                onClick={() => router.push('/admin/jobs')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: job.color }}
                />
                <div>
                  <h1 className="text-xl font-semibold">{job.title}</h1>
                  <p className="text-sm text-gray-500">{job.type} • {job.location}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/careers/${job.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Job Page
              </a>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{applications.length}</span>
              <span className="text-gray-500">Total Candidates</span>
            </div>
            {stages.slice(0, 4).map(stage => (
              <div key={stage} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stageConfig[stage]?.bg.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                <span className="text-sm text-gray-600">{stageConfig[stage]?.label}: {getAppsByStage(stage).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              data-testid="search-candidates-input"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <div key={stage} className="flex-shrink-0 w-80">
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig[stage]?.bg} ${stageConfig[stage]?.text}`}>
                        {stageConfig[stage]?.label}
                      </span>
                      <span className="text-sm text-gray-500">{getAppsByStage(stage).length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {getAppsByStage(stage).map(app => (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        data-testid={`candidate-card-${app.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{app.name}</h3>
                            <p className="text-sm text-gray-500">{app.email}</p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === app.id ? null : app.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            {activeMenu === app.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-3 py-2 text-xs text-gray-500 uppercase">Move to</div>
                                {stages.filter(s => s !== stage).map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleStageChange(app.id, s)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                    {stageConfig[s]?.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(app.rating)}
                          <span className="text-xs text-gray-500 ml-1">{formatRating(app.rating)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                        
                        {(app.linkedin || app.portfolio || app.resume_url) && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            {app.resume_url && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Resume</span>
                            )}
                            {app.linkedin && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">LinkedIn</span>
                            )}
                            {app.portfolio && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">Portfolio</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {getAppsByStage(stage).length === 0 && (
                      <div className="py-8 text-center text-gray-400 text-sm">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.size === filteredApps.length && filteredApps.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(filteredApps.map(a => a.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Applied</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelection(app.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{app.name}</p>
                        <p className="text-sm text-gray-500">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {renderStars(app.rating)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig[app.stage]?.bg} ${stageConfig[app.stage]?.text}`}>
                        {stageConfig[app.stage]?.label || app.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Mail className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApps.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No candidates found for this job.
              </div>
            )}
          </div>
        )}
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
