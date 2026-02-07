'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Filter, Trash2, Loader2, Mail, 
  ChevronRight, Clock, X, FileText, ExternalLink,
  Star, Briefcase, LayoutGrid, ArrowLeft
} from 'lucide-react';
import { createPortal } from 'react-dom';

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
  cover_letter?: string;
  job_id?: string;
  job_title?: string;
  job_slug?: string;
}

interface Job {
  id: string;
  title: string;
  slug: string;
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

const stages = Object.keys(stageConfig);

interface CandidatesClientProps {
  initialApplications: Application[];
  jobs: Job[];
  serverError: string | null;
  userRole?: string;
}

export default function CandidatesClient({ initialApplications, jobs, serverError, userRole }: CandidatesClientProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isChangingStage, setIsChangingStage] = useState(false);

  // Filtering logic
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || app.stage === stageFilter;
    const matchesJob = jobFilter === 'all' || app.job_id === jobFilter;
    return matchesSearch && matchesStage && matchesJob;
  });

  const openDrawer = (app: Application) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  const handleRatingChange = async (id: string, rating: number) => {
    setIsUpdatingRating(true);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (response.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, rating } : app));
        if (selectedApp?.id === id) {
          setSelectedApp(prev => prev ? { ...prev, rating } : null);
        }
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    } finally {
      setIsUpdatingRating(false);
    }
  };

  const handleStageChange = async (id: string, newStage: string) => {
    setIsUpdatingStage(id);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (response.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, stage: newStage } : app));
        if (selectedApp?.id === id) {
          setSelectedApp(prev => prev ? { ...prev, stage: newStage } : null);
        }
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setIsUpdatingStage(null);
      setActiveMenu(null);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== id));
        setIsDeleteDialogOpen(false);
        setAppToDelete(null);
        if (selectedApp?.id === id) {
          setIsDrawerOpen(false);
        }
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            disabled={!interactive}
            onClick={(e) => {
              e.stopPropagation();
              onRate?.(s);
            }}
            className={`${interactive ? 'hover:scale-125 transition-transform' : ''} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          >
            <Star className={`w-3.5 h-3.5 ${s <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  const formatRating = (r: number) => (r || 0).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/jobs')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-semibold">Candidate Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
               Total Candidates: {applications.length}
             </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Filters bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select 
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm font-medium text-gray-700"
              >
                <option value="all">All Stages</option>
                {stages.map(s => <option key={s} value={s}>{stageConfig[s].label}</option>)}
              </select>
            </div>

            <div className="relative min-w-[160px]">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select 
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm font-medium text-gray-700"
              >
                <option value="all">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Job Applied For</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Applied At</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map(app => (
                <tr 
                  key={app.id} 
                  onClick={() => openDrawer(app)}
                  className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{app.name}</p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {app.job_title ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{app.job_title}</p>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded">Job Deleted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {renderStars(app.rating, true, (r) => handleRatingChange(app.id, r))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${stageConfig[app.stage]?.bg} ${stageConfig[app.stage]?.text}`}>
                      {stageConfig[app.stage]?.label || app.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => {
                          setAppToDelete(app);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all active:scale-90" 
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredApps.length === 0 && (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-bold">No candidates matches your search</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </main>

      {/* Applicant Detail Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <div 
          className={`bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative z-10 transition-all duration-300 transform ${isDrawerOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'} flex flex-col`}
        >
          {selectedApp && (
            <>
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Applicant Details</h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all hover:rotate-90 group"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-inner">
                    {selectedApp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{selectedApp.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm ${stageConfig[selectedApp.stage]?.bg} ${stageConfig[selectedApp.stage]?.text}`}>
                        {stageConfig[selectedApp.stage]?.label}
                      </span>
                      <span className="text-gray-400 font-medium text-sm">• Applied {new Date(selectedApp.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="space-y-6">
                    <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100/50">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Candidate Rating</h4>
                      <div className="flex flex-col items-center gap-4 py-2">
                        {renderStars(selectedApp.rating, true, (r) => handleRatingChange(selectedApp.id, r))}
                        <div className="flex items-baseline gap-1">
                          <p className="text-4xl font-black text-gray-900">{formatRating(selectedApp.rating)}</p>
                          <span className="text-gray-400 font-bold text-sm">/ 5.0</span>
                        </div>
                        {isUpdatingRating && <span className="text-[10px] font-bold text-indigo-600 animate-pulse uppercase tracking-wider">Updating Profile...</span>}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Contact Details</h4>
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email</p>
                            <a href={`mailto:${selectedApp.email}`} className="text-gray-900 font-semibold hover:text-indigo-600 transition-colors truncate block max-w-[200px]">{selectedApp.email}</a>
                          </div>
                        </div>
                        {selectedApp.phone && (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                              <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Phone</p>
                              <p className="text-gray-900 font-semibold">{selectedApp.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Documents</h4>
                      {selectedApp.resume_url ? (
                        <div className="group relative bg-white border border-gray-100 rounded-3xl p-5 hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[100px] -mr-12 -mt-12 transition-all group-hover:scale-110" />
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">Resume.pdf</p>
                              <p className="text-xs text-gray-400 font-medium">Standard applicant resume</p>
                            </div>
                          </div>
                          <div className="mt-6 flex gap-2 relative z-10">
                            <a href={selectedApp.resume_url} download target="_blank" className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-extrabold hover:bg-red-600 hover:text-white transition-all text-center uppercase tracking-widest">Download</a>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
                          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No Resume Uploaded</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Professional Links</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedApp.linkedin && (
                          <a href={selectedApp.linkedin} target="_blank" className="flex items-center justify-between p-4 bg-blue-50/30 border border-blue-100 rounded-2xl hover:bg-blue-50 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ExternalLink className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-bold text-blue-900 uppercase tracking-tight">LinkedIn Profile</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                          </a>
                        )}
                        {selectedApp.portfolio && (
                          <a href={selectedApp.portfolio} target="_blank" className="flex items-center justify-between p-4 bg-purple-50/30 border border-purple-100 rounded-2xl hover:bg-purple-50 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <LayoutGrid className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-sm font-bold text-purple-900 uppercase tracking-tight">Portfolio Website</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedApp.cover_letter && (
                  <div className="mt-8 space-y-4 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-amber-600" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cover Letter</h4>
                    </div>
                    <div className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100/50">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                        "{selectedApp.cover_letter}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-gray-100 bg-white">
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
                          <span className="uppercase tracking-wider">{stageConfig[s].label}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setIsChangingStage(false)} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setIsChangingStage(true)} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]">Update Stage</button>
                    <button onClick={() => setIsDrawerOpen(false)} className="px-6 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98]">Close</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isDeleting && setIsDeleteDialogOpen(false)} />
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Candidate?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-800">{appToDelete?.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                <button disabled={isDeleting} onClick={() => appToDelete && handleDeleteApplication(appToDelete.id)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
