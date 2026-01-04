import { useState } from 'react';
import { Star, Mail, FileText, Clock, User, CheckSquare, Square } from 'lucide-react';

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
}

interface KanbanBoardProps {
  applications: Application[];
  onApplicationClick: (app: Application) => void;
  onStatusChange: (appId: string, newStatus: Application['status']) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: '#3B82F6' },
  { id: 'screening', label: 'Screening', color: '#F59E0B' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', color: '#8B5CF6' },
  { id: 'interview_complete', label: 'Interview Complete', color: '#6366F1' },
  { id: 'offer_pending', label: 'Offer Pending', color: '#06B6D4' },
  { id: 'hired', label: 'Hired', color: '#10B981' },
  { id: 'rejected', label: 'Rejected', color: '#EF4444' },
  { id: 'on_hold', label: 'On Hold', color: '#6B7280' },
] as const;

export function KanbanBoard({ 
  applications, 
  onApplicationClick, 
  onStatusChange,
  selectedIds,
  onSelectionChange 
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter((app) => app.status === stageId);
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedCard(appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedCard) {
      const app = applications.find((a) => a.id === draggedCard);
      if (app && app.status !== stageId) {
        // Show confirmation for sensitive transitions
        if (stageId === 'rejected' || stageId === 'hired') {
          if (
            window.confirm(
              `Are you sure you want to move ${app.applicantName} to ${
                PIPELINE_STAGES.find((s) => s.id === stageId)?.label
              }?`
            )
          ) {
            onStatusChange(draggedCard, stageId as Application['status']);
          }
        } else {
          onStatusChange(draggedCard, stageId as Application['status']);
        }
      }
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStarRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleCheckboxClick = (e: React.MouseEvent, appId: string, stageApps: Application[]) => {
    e.stopPropagation();
    
    const newSelectedIds = new Set(selectedIds);
    
    // Shift+click for range selection
    if (e.shiftKey && lastSelectedId) {
      const allIds = stageApps.map(app => app.id);
      const lastIndex = allIds.indexOf(lastSelectedId);
      const currentIndex = allIds.indexOf(appId);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        
        for (let i = start; i <= end; i++) {
          newSelectedIds.add(allIds[i]);
        }
      }
    } else {
      // Toggle single selection
      if (newSelectedIds.has(appId)) {
        newSelectedIds.delete(appId);
      } else {
        newSelectedIds.add(appId);
      }
    }
    
    setLastSelectedId(appId);
    onSelectionChange(newSelectedIds);
  };

  const handleSelectAllInStage = (stageId: string) => {
    const stageApps = getApplicationsByStage(stageId);
    const stageAppIds = stageApps.map(app => app.id);
    const allSelected = stageAppIds.every(id => selectedIds.has(id));
    
    const newSelectedIds = new Set(selectedIds);
    
    if (allSelected) {
      // Deselect all in stage
      stageAppIds.forEach(id => newSelectedIds.delete(id));
    } else {
      // Select all in stage
      stageAppIds.forEach(id => newSelectedIds.add(id));
    }
    
    onSelectionChange(newSelectedIds);
  };

  const isStageAllSelected = (stageId: string) => {
    const stageApps = getApplicationsByStage(stageId);
    if (stageApps.length === 0) return false;
    return stageApps.every(app => selectedIds.has(app.id));
  };

  const isStagePartiallySelected = (stageId: string) => {
    const stageApps = getApplicationsByStage(stageId);
    if (stageApps.length === 0) return false;
    const selectedInStage = stageApps.filter(app => selectedIds.has(app.id));
    return selectedInStage.length > 0 && selectedInStage.length < stageApps.length;
  };

  return (
    <div className="flex-1 overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-max px-6">
        {PIPELINE_STAGES.map((stage) => {
          const stageApps = getApplicationsByStage(stage.id);
          const isDropTarget = dragOverColumn === stage.id;
          const allSelected = isStageAllSelected(stage.id);
          const partiallySelected = isStagePartiallySelected(stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col w-[320px] flex-shrink-0"
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div
                className="px-4 py-3 rounded-lg mb-3 flex items-center justify-between"
                style={{ backgroundColor: `${stage.color}15` }}
              >
                <div className="flex items-center gap-2">
                  {/* Select All in Stage Checkbox */}
                  {stageApps.length > 0 && (
                    <button
                      onClick={() => handleSelectAllInStage(stage.id)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                      title={allSelected ? 'Deselect all in stage' : 'Select all in stage'}
                      data-testid={`select-all-${stage.id}`}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4" style={{ color: stage.color }} />
                      ) : partiallySelected ? (
                        <div className="w-4 h-4 border-2 rounded flex items-center justify-center" style={{ borderColor: stage.color }}>
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: stage.color }} />
                        </div>
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-gray-900">{stage.label}</h3>
                </div>
                <span
                  className="px-2 py-1 rounded text-sm"
                  style={{ backgroundColor: `${stage.color}25`, color: stage.color }}
                >
                  {stageApps.length}
                </span>
              </div>

              {/* Column Content */}
              <div
                className={`flex-1 space-y-3 p-2 rounded-lg transition-colors min-h-[200px] ${
                  isDropTarget ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''
                }`}
              >
                {stageApps.map((app) => {
                  const isSelected = selectedIds.has(app.id);
                  
                  return (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      className={`bg-white rounded-lg p-4 shadow-sm border-2 hover:shadow-md transition-all cursor-move ${
                        draggedCard === app.id ? 'opacity-50' : ''
                      } ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}
                      data-testid={`candidate-card-${app.id}`}
                    >
                      {/* Card Header with Checkbox */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Selection Checkbox */}
                        <button
                          onClick={(e) => handleCheckboxClick(e, app.id, stageApps)}
                          className="mt-1 flex-shrink-0"
                          data-testid={`select-${app.id}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                          <span className="text-sm">{getInitials(app.applicantName)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-gray-900 truncate cursor-pointer hover:text-blue-600"
                            onClick={() => onApplicationClick(app)}
                          >
                            {app.applicantName}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">{app.jobTitle}</p>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="space-y-2 text-sm ml-8">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Applied {app.appliedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="w-4 h-4" />
                          <span className="truncate">{app.email}</span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 ml-8">
                        <div className="flex items-center gap-2">
                          {renderStarRating(app.rating)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {app.daysInStage}d in stage
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-3 ml-8">
                        <button
                          onClick={() => onApplicationClick(app)}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${app.email}`;
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Email
                        </button>
                      </div>
                    </div>
                  );
                })}

                {stageApps.length === 0 && !isDropTarget && (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
