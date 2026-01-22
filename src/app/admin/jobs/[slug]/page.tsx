'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Users, Search, Filter, LayoutGrid, Table as TableIcon,
  Star, Mail, FileText, Eye, MoreVertical, ChevronRight, Loader2,
  CheckSquare, Square, Clock, Edit, ExternalLink, X
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
  const slug = params.slug as string;
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState<string | null>(null);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      // First fetch job by slug
      const jobRes = await fetch(`/api/jobs/${slug}`);
      if (!jobRes.ok) throw new Error('Failed to fetch job');
      const jobData = await jobRes.json();
      setJob(jobData);

      // Then fetch applications using job ID
      const appsRes = await fetch(`/api/applications?jobId=${jobData.id}`);
      if (appsRes.ok) setApplications(await appsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId: string, newStage: string) => {
    setIsUpdatingStage(appId);
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
        if (selectedApp?.id === appId) {
          setSelectedApp(prev => prev ? { ...prev, stage: newStage, status: newStage } : null);
        }
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setIsUpdatingStage(null);
      setActiveMenu(null);
    }
  };

  const handleRatingChange = async (appId: string, newRating: number) => {
    setIsUpdatingRating(true);
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });
      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === appId ? { ...app, rating: newRating } : app
        ));
        if (selectedApp?.id === appId) {
          setSelectedApp(prev => prev ? { ...prev, rating: newRating } : null);
        }
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    } finally {
      setIsUpdatingRating(false);
    }
  };

  const openDrawer = (app: Application) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
    setIsChangingStage(false);
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

  const renderStars = (rating: number | string | null | undefined, isInteractive = false, onRate?: (r: number) => void) => {
    const numRating = Number(rating) || 0;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            disabled={!isInteractive || isUpdatingRating}
            onClick={(e) => {
              if (isInteractive && onRate) {
                e.stopPropagation();
                onRate(i + 1);
              }
            }}
            className={`${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${isInteractive ? 'w-5 h-5' : 'w-3 h-3'} ${i < Math.round(numRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
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
                onClick={() => {
                  setIsNavigating(true);
                  router.push('/admin/jobs');
                }}
                disabled={isNavigating}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                {isNavigating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5" />}
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
                href={`/${job.slug}`}
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
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl">
              <Users className="w-5 h-5 text-indigo-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-indigo-900 leading-none">{applications.length}</span>
                <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">Candidates</span>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            {stages.slice(0, 5).map(stage => (
              <div key={stage} className="flex flex-col gap-1 min-w-fit">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm ${stageConfig[stage]?.bg.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stageConfig[stage]?.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 pl-4">{getAppsByStage(stage).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              data-testid="search-candidates-input"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pb-4">
            {stages.map(stage => (
              <div 
                key={stage} 
                className="flex flex-col"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-gray-200');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-gray-200');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-gray-200');
                  const appId = e.dataTransfer.getData('applicationId');
                  if (appId) {
                    handleStageChange(appId, stage);
                  }
                }}
              >
                <div className="bg-gray-100 rounded-xl p-3 flex-1 flex flex-col transition-colors duration-200 min-h-[500px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${stageConfig[stage]?.bg} ${stageConfig[stage]?.text}`}>
                        {stageConfig[stage]?.label}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">{getAppsByStage(stage).length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    {getAppsByStage(stage).map(app => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('applicationId', app.id);
                        }}
                        onClick={() => openDrawer(app)}
                        className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group"
                        data-testid={`candidate-card-${app.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{app.name}</h3>
                            <p className="text-[11px] text-gray-500 truncate">{app.email}</p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === app.id ? null : app.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            
                            {activeMenu === app.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">Move to</div>
                                {stages.filter(s => s !== stage).map(s => (
                                  <button
                                    key={s}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStageChange(app.id, s);
                                    }}
                                    disabled={isUpdatingStage === app.id}
                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 group/item disabled:opacity-50"
                                  >
                                    {isUpdatingStage === app.id ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    ) : (
                                      <ChevronRight className="w-2.5 h-2.5 text-gray-300 group-hover/item:text-indigo-600" />
                                    )}
                                    {stageConfig[s]?.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(app.rating)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                          <Clock className="w-2.5 h-2.5" />
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
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map(app => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
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
                        {renderStars(app.rating, true, (r) => handleRatingChange(app.id, r))}
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
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === 'table-' + app.id ? null : 'table-' + app.id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            title="Move Stage"
                          >
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all cursor-pointer ${stageConfig[app.stage]?.bg} ${stageConfig[app.stage]?.text} hover:ring-2 hover:ring-indigo-500/20`}>
                              {stageConfig[app.stage]?.label || app.stage}
                            </span>
                          </button>
                          
                          {activeMenu === 'table-' + app.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-200">
                              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 mb-1">Move to</div>
                              {stages.filter(s => s !== app.stage).map(s => (
                                <button
                                  key={s}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageChange(app.id, s);
                                  }}
                                  disabled={isUpdatingStage === app.id}
                                  className="w-full px-3 py-2 text-left text-xs hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between group/item disabled:opacity-50"
                                >
                                  <span className="font-semibold">{stageConfig[s]?.label}</span>
                                  {isUpdatingStage === app.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover/item:text-indigo-600 transition-transform group-hover/item:translate-x-0.5" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(app);
                          }}
                          className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all active:scale-90" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all active:scale-90" 
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
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

      {/* Applicant Detail Drawer */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <div 
          className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        >
          {selectedApp && (
            <>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Applicant Details</h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedApp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedApp.name}</h3>
                    <p className="text-gray-500">{selectedApp.email}</p>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wider text-center">Current Rating</h4>
                  <div className="flex flex-col items-center gap-3">
                    {renderStars(selectedApp.rating, true, (r) => handleRatingChange(selectedApp.id, r))}
                    <p className="text-3xl font-bold text-gray-900">{formatRating(selectedApp.rating)}</p>
                    {isUpdatingRating && <span className="text-xs text-indigo-600 animate-pulse">Updating...</span>}
                  </div>
                </div>

                {/* Status Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied on</p>
                    <p className="text-gray-900 font-medium">{new Date(selectedApp.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stage</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stageConfig[selectedApp.stage]?.bg} ${stageConfig[selectedApp.stage]?.text}`}>
                      {stageConfig[selectedApp.stage]?.label}
                    </span>
                  </div>
                </div>

                {/* Contact & Links */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a href={`mailto:${selectedApp.email}`} className="text-indigo-600 hover:underline font-medium">{selectedApp.email}</a>
                    </div>
                  </div>
                  {selectedApp.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-gray-900 font-medium">{selectedApp.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedApp.linkedin && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">LinkedIn</p>
                        <a href={selectedApp.linkedin} target="_blank" className="text-blue-600 hover:underline font-medium">View Profile</a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900">Documents</h4>
                  {selectedApp.resume_url ? (
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Resume.pdf</p>
                          <p className="text-xs text-gray-500">Click to download</p>
                        </div>
                      </div>
                      <a 
                        href={selectedApp.resume_url}
                        download
                        target="_blank"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-indigo-600"
                        title="Download Resume"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No resume uploaded</p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0">
                {isChangingStage ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h4 className="text-sm font-bold text-gray-900 px-1">Select New Stage</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {stages.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStageChange(selectedApp.id, s);
                            setIsChangingStage(false);
                          }}
                          disabled={isUpdatingStage === selectedApp.id}
                          className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 text-left flex flex-col gap-1 ${
                            selectedApp.stage === s 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                              : 'border-transparent bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="uppercase tracking-wider">{stageConfig[s]?.label}</span>
                          <span className="text-[10px] opacity-70 font-medium">Click to update</span>
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setIsChangingStage(false)}
                      className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsChangingStage(true)}
                      className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
                    >
                      Update Stage
                    </button>
                    <button 
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-6 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {(activeMenu || isDrawerOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setActiveMenu(null);
          }}
        />
      )}
    </div>
  );
}
