'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { LogOut, Briefcase, Users, FileText, Eye, X, LayoutGrid, Table, Star, CheckSquare, Square, Settings, Loader2 } from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';
import { CandidateRating } from './CandidateRating';
import { CandidateNotes, Note } from './CandidateNotes';
import { SearchFilters, FilterState, SavedFilter } from './SearchFilters';
import { BulkActionsBar } from './BulkActionsBar';
import { JobManagement } from './JobManagement';

interface Rating {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  category?: string;
  createdAt: string;
}

interface Application {
  id: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'new' | 'screening' | 'interview_scheduled' | 'interview_complete' | 'offer_pending' | 'hired' | 'rejected' | 'on_hold';
  resume: string;
  linkedIn?: string;
  portfolio?: string;
  coverLetter?: string;
  rating?: number;
  daysInStage: number;
  ratings: Rating[];
  notes: Note[];
  tags?: string[];
  assignedTo?: string;
  isArchived?: boolean;
}

const PIPELINE_STAGES = [
  { id: 'new', label: 'New' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview_scheduled', label: 'Interview Scheduled' },
  { id: 'interview_complete', label: 'Interview Complete' },
  { id: 'offer_pending', label: 'Offer Pending' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'on_hold', label: 'On Hold' },
];

const AVAILABLE_TAGS = ['High Priority', 'Referral', 'Senior Level', 'Remote OK', 'Urgent', 'Follow Up'];

const AVAILABLE_REVIEWERS = [
  { id: 'admin1', name: 'Alice Johnson' },
  { id: 'admin2', name: 'Bob Wilson' },
  { id: 'admin3', name: 'Carol Davis' },
  { id: 'admin4', name: 'David Lee' },
];

const mockApplications: Application[] = [
  {
    id: '1',
    jobTitle: 'Full stack developer',
    applicantName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    appliedDate: '2025-12-07',
    status: 'new',
    resume: 'john_doe_resume.pdf',
    linkedIn: 'https://linkedin.com/in/johndoe',
    coverLetter: 'I am excited to apply...',
    rating: 4,
    daysInStage: 2,
    tags: ['Referral'],
    ratings: [{ id: 'r1', reviewerId: 'admin1', reviewerName: 'Alice Johnson', rating: 4, category: 'technical', createdAt: 'Dec 7, 2025' }],
    notes: [{ id: 'n1', applicationId: '1', authorId: 'admin1', authorName: 'Alice Johnson', noteType: 'phone_screen', content: 'Strong technical background.', isPinned: true, visibility: 'team', createdAt: 'Dec 7, 2025, 2:30 PM', canEdit: true }]
  },
  {
    id: '2',
    jobTitle: 'Senior product designer',
    applicantName: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 987-6543',
    appliedDate: '2025-12-06',
    status: 'screening',
    resume: 'jane_smith_resume.pdf',
    portfolio: 'https://janesmith.design',
    rating: 5,
    daysInStage: 3,
    tags: ['High Priority', 'Senior Level'],
    ratings: [{ id: 'r2', reviewerId: 'admin1', reviewerName: 'Alice Johnson', rating: 5, category: 'overall', createdAt: 'Dec 6, 2025' }],
    notes: [{ id: 'n2', applicationId: '2', authorId: 'admin1', authorName: 'Alice Johnson', noteType: 'general', content: 'Excellent portfolio.', isPinned: false, visibility: 'team', createdAt: 'Dec 6, 2025, 10:15 AM', canEdit: true }]
  },
  {
    id: '3',
    jobTitle: 'Customer success manager',
    applicantName: 'Mike Johnson',
    email: 'mike.j@email.com',
    phone: '+1 (555) 456-7890',
    appliedDate: '2025-12-05',
    status: 'interview_scheduled',
    resume: 'mike_johnson_resume.pdf',
    linkedIn: 'https://linkedin.com/in/mikejohnson',
    rating: 3,
    daysInStage: 4,
    ratings: [{ id: 'r4', reviewerId: 'admin2', reviewerName: 'Bob Wilson', rating: 3, category: 'overall', createdAt: 'Dec 5, 2025' }],
    notes: [{ id: 'n3', applicationId: '3', authorId: 'admin2', authorName: 'Bob Wilson', noteType: 'interview', content: 'Interview scheduled for Dec 10th.', isPinned: true, visibility: 'team', createdAt: 'Dec 5, 2025, 3:45 PM', canEdit: false }]
  },
  {
    id: '4',
    jobTitle: 'Full stack developer',
    applicantName: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '+1 (555) 234-5678',
    appliedDate: '2025-12-04',
    status: 'interview_complete',
    resume: 'sarah_williams_resume.pdf',
    portfolio: 'https://sarahw.dev',
    rating: 4.5,
    daysInStage: 1,
    tags: ['High Priority'],
    ratings: [{ id: 'r5', reviewerId: 'admin1', reviewerName: 'Alice Johnson', rating: 4.5, category: 'overall', createdAt: 'Dec 4, 2025' }],
    notes: [{ id: 'n4', applicationId: '4', authorId: 'admin1', authorName: 'Alice Johnson', noteType: 'interview', content: 'Excellent performance.', isPinned: true, visibility: 'team', createdAt: 'Dec 4, 2025, 4:20 PM', canEdit: true }]
  },
  {
    id: '5',
    jobTitle: 'Strategy & operations',
    applicantName: 'David Chen',
    email: 'david.chen@email.com',
    phone: '+1 (555) 345-6789',
    appliedDate: '2025-12-03',
    status: 'offer_pending',
    resume: 'david_chen_resume.pdf',
    rating: 5,
    daysInStage: 2,
    ratings: [{ id: 'r6', reviewerId: 'admin1', reviewerName: 'Alice Johnson', rating: 5, category: 'overall', createdAt: 'Dec 3, 2025' }],
    notes: [{ id: 'n5', applicationId: '5', authorId: 'admin1', authorName: 'Alice Johnson', noteType: 'general', content: 'Preparing offer letter.', isPinned: true, visibility: 'private', createdAt: 'Dec 3, 2025, 11:00 AM', canEdit: true }]
  },
  {
    id: '6',
    jobTitle: 'Senior product designer',
    applicantName: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1 (555) 456-7891',
    appliedDate: '2025-12-02',
    status: 'hired',
    resume: 'emily_rodriguez_resume.pdf',
    rating: 5,
    daysInStage: 1,
    ratings: [{ id: 'r7', reviewerId: 'admin1', reviewerName: 'Alice Johnson', rating: 5, category: 'overall', createdAt: 'Dec 2, 2025' }],
    notes: [{ id: 'n6', applicationId: '6', authorId: 'admin1', authorName: 'Alice Johnson', noteType: 'general', content: 'Accepted offer!', isPinned: true, visibility: 'team', createdAt: 'Dec 2, 2025, 9:30 AM', canEdit: true }]
  },
  {
    id: '7',
    jobTitle: 'Full stack developer',
    applicantName: 'Robert Taylor',
    email: 'robert.t@email.com',
    phone: '+1 (555) 567-8901',
    appliedDate: '2025-12-01',
    status: 'rejected',
    resume: 'robert_taylor_resume.pdf',
    rating: 2,
    daysInStage: 5,
    ratings: [{ id: 'r8', reviewerId: 'admin2', reviewerName: 'Bob Wilson', rating: 2, category: 'overall', createdAt: 'Dec 1, 2025' }],
    notes: [{ id: 'n7', applicationId: '7', authorId: 'admin2', authorName: 'Bob Wilson', noteType: 'general', content: 'Lacks required skills.', isPinned: false, visibility: 'team', createdAt: 'Dec 1, 2025, 5:00 PM', canEdit: false }]
  },
  {
    id: '8',
    jobTitle: 'Customer success manager',
    applicantName: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 (555) 678-9012',
    appliedDate: '2025-11-30',
    status: 'on_hold',
    resume: 'lisa_anderson_resume.pdf',
    rating: 3.5,
    daysInStage: 7,
    tags: ['Follow Up'],
    ratings: [{ id: 'r9', reviewerId: 'admin1', reviewerName: 'Alice Johnson', rating: 3.5, category: 'overall', createdAt: 'Nov 30, 2025' }],
    notes: [{ id: 'n8', applicationId: '8', authorId: 'admin1', authorName: 'Alice Johnson', noteType: 'other', content: 'Waiting for budget approval.', isPinned: true, visibility: 'team', createdAt: 'Nov 30, 2025, 1:15 PM', canEdit: true }]
  }
];

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [showJobManagement, setShowJobManagement] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; undoAction?: () => void } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    positions: [],
    stages: [],
    ratingMin: 0,
    ratingMax: 5,
    dateFrom: '',
    dateTo: '',
    hasResume: null,
    hasNotes: null,
    hasLinkedIn: null,
    hasPortfolio: null,
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Fetch applications from API
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch('/api/applications');
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match component structure
          const transformedData = data.map((app: Application & { name?: string; position?: string; appliedAt?: string; resumeUrl?: string }) => ({
            ...app,
            jobTitle: app.position || app.jobTitle,
            applicantName: app.name || app.applicantName,
            appliedDate: app.appliedAt?.split('T')[0] || app.appliedDate,
            resume: app.resumeUrl || app.resume,
            daysInStage: app.daysInStage || Math.floor((Date.now() - new Date(app.appliedAt || app.appliedDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
            ratings: app.ratings || [],
            notes: app.notes || [],
          }));
          if (transformedData.length > 0) {
            setApplications(transformedData);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        // Keep mock data on error
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const positions = useMemo(() => [...new Set(applications.map(app => app.jobTitle))], [applications]);

  const allTags = useMemo(() => {
    const tags = new Set(AVAILABLE_TAGS);
    applications.forEach(app => app.tags?.forEach(tag => tags.add(tag)));
    return [...tags];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (app.isArchived) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!app.applicantName.toLowerCase().includes(query) &&
            !app.email.toLowerCase().includes(query) &&
            !app.phone.toLowerCase().includes(query) &&
            !app.jobTitle.toLowerCase().includes(query)) return false;
      }
      if (filters.positions.length > 0 && !filters.positions.includes(app.jobTitle)) return false;
      if (filters.stages.length > 0 && !filters.stages.includes(app.status)) return false;
      const appRating = app.rating || 0;
      if (appRating < filters.ratingMin || appRating > filters.ratingMax) return false;
      if (filters.dateFrom && new Date(app.appliedDate) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(app.appliedDate) > new Date(filters.dateTo)) return false;
      if (filters.hasResume !== null && !!app.resume !== filters.hasResume) return false;
      if (filters.hasNotes !== null && (app.notes.length > 0) !== filters.hasNotes) return false;
      if (filters.hasLinkedIn !== null && !!app.linkedIn !== filters.hasLinkedIn) return false;
      if (filters.hasPortfolio !== null && !!app.portfolio !== filters.hasPortfolio) return false;
      return true;
    });
  }, [applications, filters]);

  const showToast = (message: string, type: 'success' | 'error', undoAction?: () => void) => {
    setToast({ message, type, undoAction });
    setTimeout(() => setToast(null), undoAction ? 30000 : 5000);
  };

  const handleBulkMoveToStage = useCallback((stage: string) => {
    setIsProcessing(true);
    const previousStates = new Map<string, Application['status']>();
    setApplications(prev => prev.map(app => {
      if (selectedIds.has(app.id)) {
        previousStates.set(app.id, app.status);
        return { ...app, status: stage as Application['status'], daysInStage: 0 };
      }
      return app;
    }));
    setIsProcessing(false);
    setSelectedIds(new Set());
    showToast(`Moved ${selectedIds.size} candidate(s)`, 'success', () => {
      setApplications(prev => prev.map(app => previousStates.has(app.id) ? { ...app, status: previousStates.get(app.id)! } : app));
    });
  }, [selectedIds]);

  const handleBulkSendEmail = useCallback(() => {
    const emails = applications.filter(app => selectedIds.has(app.id)).map(app => app.email).join(',');
    window.location.href = `mailto:${emails}`;
    showToast(`Opening email client`, 'success');
  }, [selectedIds, applications]);

  const handleBulkArchive = useCallback(() => {
    const archivedIds = new Set(selectedIds);
    setApplications(prev => prev.map(app => selectedIds.has(app.id) ? { ...app, isArchived: true } : app));
    setSelectedIds(new Set());
    showToast(`Archived ${archivedIds.size} candidate(s)`, 'success', () => {
      setApplications(prev => prev.map(app => archivedIds.has(app.id) ? { ...app, isArchived: false } : app));
    });
  }, [selectedIds]);

  const handleBulkAddTag = useCallback((tag: string) => {
    setApplications(prev => prev.map(app => {
      if (selectedIds.has(app.id)) {
        const currentTags = app.tags || [];
        if (!currentTags.includes(tag)) return { ...app, tags: [...currentTags, tag] };
      }
      return app;
    }));
    showToast(`Added tag "${tag}"`, 'success');
  }, [selectedIds]);

  const handleBulkRemoveTag = useCallback((tag: string) => {
    setApplications(prev => prev.map(app => {
      if (selectedIds.has(app.id) && app.tags) return { ...app, tags: app.tags.filter(t => t !== tag) };
      return app;
    }));
    showToast(`Removed tag "${tag}"`, 'success');
  }, [selectedIds]);

  const handleBulkAssignReviewer = useCallback((reviewerId: string) => {
    const reviewer = AVAILABLE_REVIEWERS.find(r => r.id === reviewerId);
    setApplications(prev => prev.map(app => selectedIds.has(app.id) ? { ...app, assignedTo: reviewerId } : app));
    showToast(`Assigned ${reviewer?.name}`, 'success');
  }, [selectedIds]);

  const handleBulkExport = useCallback((format: 'csv' | 'excel') => {
    const selectedApps = applications.filter(app => selectedIds.has(app.id));
    const headers = ['Name', 'Email', 'Phone', 'Position', 'Applied Date', 'Status', 'Rating'];
    const rows = selectedApps.map(app => [app.applicantName, app.email, app.phone, app.jobTitle, app.appliedDate, app.status, app.rating?.toString() || '']);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidates_export.csv`;
    link.click();
    showToast(`Exported ${selectedIds.size} candidate(s)`, 'success');
  }, [selectedIds, applications]);

  const handleBulkDelete = useCallback(() => {
    const deletedApps = applications.filter(app => selectedIds.has(app.id));
    setApplications(prev => prev.filter(app => !selectedIds.has(app.id)));
    setSelectedIds(new Set());
    showToast(`Deleted ${deletedApps.length} candidate(s)`, 'success', () => setApplications(prev => [...prev, ...deletedApps]));
  }, [selectedIds, applications]);

  const handleStatusChange = (appId: string, newStatus: Application['status']) => {
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus, daysInStage: 0 } : app));
  };

  const handleAddRating = (appId: string, rating: number, category?: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const newRating: Rating = { id: `r${Date.now()}`, reviewerId: 'admin1', reviewerName: 'Current User', rating, category, createdAt: new Date().toLocaleDateString() };
      const updatedRatings = [...app.ratings, newRating];
      return { ...app, ratings: updatedRatings, rating: updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length };
    }));
  };

  const handleAddNote = (appId: string, note: Omit<Note, 'id' | 'applicationId' | 'authorId' | 'authorName' | 'createdAt' | 'canEdit'>) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const newNote: Note = { id: `n${Date.now()}`, applicationId: appId, authorId: 'admin1', authorName: 'Current User', ...note, createdAt: new Date().toLocaleString(), canEdit: true };
      return { ...app, notes: [...app.notes, newNote] };
    }));
  };

  const handleUpdateNote = (appId: string, noteId: string, updates: Partial<Note>) => {
    setApplications(prev => prev.map(app => app.id !== appId ? app : { ...app, notes: app.notes.map(note => note.id === noteId ? { ...note, ...updates } : note) }));
  };

  const handleDeleteNote = (appId: string, noteId: string) => {
    setApplications(prev => prev.map(app => app.id !== appId ? app : { ...app, notes: app.notes.filter(note => note.id !== noteId) }));
  };

  const handleTogglePin = (appId: string, noteId: string) => {
    setApplications(prev => prev.map(app => app.id !== appId ? app : { ...app, notes: app.notes.map(note => note.id === noteId ? { ...note, isPinned: !note.isPinned } : note) }));
  };

  const handleSelectAllVisible = useCallback(() => {
    const visibleIds = filteredApplications.map(app => app.id);
    setSelectedIds(prev => visibleIds.every(id => prev.has(id)) ? new Set() : new Set(visibleIds));
  }, [filteredApplications]);

  const handleRowSelect = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(appId) ? newSet.delete(appId) : newSet.add(appId);
      return newSet;
    });
  };

  const isAllVisibleSelected = filteredApplications.length > 0 && filteredApplications.every(app => selectedIds.has(app.id));
  const isPartiallySelected = filteredApplications.some(app => selectedIds.has(app.id)) && !isAllVisibleSelected;

  const stats = {
    total: filteredApplications.length,
    new: filteredApplications.filter(a => a.status === 'new').length,
    screening: filteredApplications.filter(a => a.status === 'screening').length
  };

  const getStatusColor = (status: Application['status']) => ({
    new: 'bg-blue-100 text-blue-700',
    screening: 'bg-yellow-100 text-yellow-700',
    interview_scheduled: 'bg-purple-100 text-purple-700',
    interview_complete: 'bg-indigo-100 text-indigo-700',
    offer_pending: 'bg-cyan-100 text-cyan-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-gray-100 text-gray-700'
  }[status]);

  const getStatusLabel = (status: Application['status']) => ({
    new: 'New', screening: 'Screening', interview_scheduled: 'Interview Scheduled',
    interview_complete: 'Interview Complete', offer_pending: 'Offer Pending',
    hired: 'Hired', rejected: 'Rejected', on_hold: 'On Hold'
  }[status]);

  if (showJobManagement) {
    return <JobManagement onBack={() => setShowJobManagement(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Job Board Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJobManagement(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              Manage Jobs
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">New Applications</p>
                <p className="text-2xl font-semibold">{stats.new}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Under Review</p>
                <p className="text-2xl font-semibold">{stats.screening}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <SearchFilters
            onFilterChange={setFilters}
            positions={positions}
            stages={PIPELINE_STAGES}
            savedFilters={savedFilters}
            onSaveFilter={(name, filterState) => setSavedFilters(prev => [...prev, { id: `f${Date.now()}`, name, filters: filterState, createdAt: new Date().toISOString(), isShared: false }])}
            onDeleteFilter={(id) => setSavedFilters(prev => prev.filter(f => f.id !== id))}
            onShareFilter={() => alert('Filter link copied!')}
            onLoadFilter={(filter) => setFilters(filter.filters)}
            resultCount={filteredApplications.length}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Applications</h2>
                {filteredApplications.length > 0 && (
                  <button onClick={handleSelectAllVisible} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    {isAllVisibleSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : isPartiallySelected ? <div className="w-4 h-4 border-2 border-blue-600 rounded flex items-center justify-center"><div className="w-2 h-2 bg-blue-600 rounded-sm" /></div> : <Square className="w-4 h-4" />}
                    <span>{isAllVisibleSelected ? 'Deselect All' : 'Select All'}</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <Table className="w-4 h-4" /><span>Table</span>
                </button>
                <button onClick={() => setViewMode('kanban')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <LayoutGrid className="w-4 h-4" /><span>Kanban</span>
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <button onClick={handleSelectAllVisible}>
                        {isAllVisibleSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : isPartiallySelected ? <div className="w-5 h-5 border-2 border-blue-600 rounded flex items-center justify-center"><div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" /></div> : <Square className="w-5 h-5 text-gray-400" />}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Applicant</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Applied</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map(app => (
                    <tr key={app.id} className={`hover:bg-gray-50 ${selectedIds.has(app.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <button onClick={(e) => handleRowSelect(app.id, e)}>
                          {selectedIds.has(app.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{app.applicantName}</p>
                        {app.tags && app.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {app.tags.slice(0, 2).map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>)}
                            {app.tags.length > 2 && <span className="text-xs text-gray-400">+{app.tags.length - 2}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{app.jobTitle}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{app.email}</p>
                        <p className="text-gray-500 text-sm">{app.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{app.appliedDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-gray-700">{app.rating?.toFixed(1) || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}>{getStatusLabel(app.status)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedApplication(app)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'kanban' && (
            <KanbanBoard
              applications={filteredApplications}
              onApplicationClick={setSelectedApplication}
              onStatusChange={handleStatusChange}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onMoveToStage={handleBulkMoveToStage}
        onSendEmail={handleBulkSendEmail}
        onArchive={handleBulkArchive}
        onAddTag={handleBulkAddTag}
        onRemoveTag={handleBulkRemoveTag}
        onAssignReviewer={handleBulkAssignReviewer}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        isProcessing={isProcessing}
        availableTags={allTags}
        availableReviewers={AVAILABLE_REVIEWERS}
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <span>{toast.message}</span>
          {toast.undoAction && <button onClick={() => { toast.undoAction?.(); setToast(null); }} className="px-2 py-1 bg-white/20 rounded text-sm font-medium">Undo</button>}
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{selectedApplication.applicantName}</h2>
                <p className="text-gray-600">{selectedApplication.jobTitle}</p>
              </div>
              <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="px-8 py-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div><p className="text-gray-500 mb-1 text-sm">Email</p><p className="text-gray-900">{selectedApplication.email}</p></div>
                <div><p className="text-gray-500 mb-1 text-sm">Phone</p><p className="text-gray-900">{selectedApplication.phone}</p></div>
                <div><p className="text-gray-500 mb-1 text-sm">Applied Date</p><p className="text-gray-900">{selectedApplication.appliedDate}</p></div>
                <div><p className="text-gray-500 mb-1 text-sm">Status</p><span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedApplication.status)}`}>{getStatusLabel(selectedApplication.status)}</span></div>
              </div>
              {selectedApplication.tags && selectedApplication.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-500 mb-2 text-sm">Tags</p>
                  <div className="flex flex-wrap gap-2">{selectedApplication.tags.map(tag => <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{tag}</span>)}</div>
                </div>
              )}
              {selectedApplication.linkedIn && <div className="mb-6"><p className="text-gray-500 mb-1 text-sm">LinkedIn</p><a href={selectedApplication.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplication.linkedIn}</a></div>}
              {selectedApplication.portfolio && <div className="mb-6"><p className="text-gray-500 mb-1 text-sm">Portfolio</p><a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplication.portfolio}</a></div>}
              <div className="mb-6"><p className="text-gray-500 mb-1 text-sm">Resume</p><p className="text-gray-900">{selectedApplication.resume}</p></div>
              {selectedApplication.coverLetter && <div className="mb-6"><p className="text-gray-500 mb-2 text-sm">Cover Letter</p><div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-700">{selectedApplication.coverLetter}</p></div></div>}
              <CandidateRating applicationId={selectedApplication.id} ratings={selectedApplication.ratings} onAddRating={(rating, category) => handleAddRating(selectedApplication.id, rating, category)} />
              <div className="border-t border-gray-200 my-8" />
              <CandidateNotes applicationId={selectedApplication.id} notes={selectedApplication.notes} currentUserId="admin1" onAddNote={(note) => handleAddNote(selectedApplication.id, note)} onUpdateNote={(noteId, updates) => handleUpdateNote(selectedApplication.id, noteId, updates)} onDeleteNote={(noteId) => handleDeleteNote(selectedApplication.id, noteId)} onTogglePin={(noteId) => handleTogglePin(selectedApplication.id, noteId)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
