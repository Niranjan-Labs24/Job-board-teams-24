import { useState } from 'react';
import { Star, Mail, FileText, Clock, User } from 'lucide-react';

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

export function KanbanBoard({ applications, onApplicationClick, onStatusChange }: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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

  return (
    <div className="flex-1 overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-max px-6">
        {PIPELINE_STAGES.map((stage) => {
          const stageApps = getApplicationsByStage(stage.id);
          const isDropTarget = dragOverColumn === stage.id;

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
                {stageApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move ${
                      draggedCard === app.id ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
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
                    <div className="space-y-2 text-sm">
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
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
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
                    <div className="flex gap-2 mt-3">
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
                ))}

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
