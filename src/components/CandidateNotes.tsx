import { useState } from 'react';
import { Pin, Edit2, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

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
  updatedAt?: string;
  canEdit: boolean; // Based on 24-hour rule
}

interface CandidateNotesProps {
  applicationId: string;
  notes: Note[];
  currentUserId: string;
  onAddNote: (note: Omit<Note, 'id' | 'applicationId' | 'authorId' | 'authorName' | 'createdAt' | 'canEdit'>) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

const NOTE_TYPES = [
  { id: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
  { id: 'phone_screen', label: 'Phone Screen', color: 'bg-blue-100 text-blue-700' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  { id: 'reference', label: 'Reference Check', color: 'bg-green-100 text-green-700' },
  { id: 'other', label: 'Other', color: 'bg-yellow-100 text-yellow-700' },
];

export function CandidateNotes({
  applicationId,
  notes,
  currentUserId,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
}: CandidateNotesProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<Note['noteType']>('general');
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'private' | 'team'>('team');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter notes
  const filteredNotes = sortedNotes.filter((note) => {
    if (filterType !== 'all' && note.noteType !== filterType) return false;
    if (filterAuthor !== 'all' && note.authorId !== filterAuthor) return false;
    if (note.visibility === 'private' && note.authorId !== currentUserId) return false;
    return true;
  });

  // Get unique authors for filter
  const uniqueAuthors = Array.from(new Set(notes.map((n) => ({ id: n.authorId, name: n.authorName }))
    .map(a => JSON.stringify(a))))
    .map(a => JSON.parse(a));

  const handleAddNote = () => {
    if (!noteContent.trim()) return;

    onAddNote({
      noteType,
      content: noteContent,
      isPinned: false,
      visibility: noteVisibility,
      updatedAt: new Date().toISOString(),
    });

    // Reset form
    setNoteContent('');
    setNoteType('general');
    setNoteVisibility('team');
    setShowAddNote(false);
  };

  const handleUpdateNote = (noteId: string) => {
    if (!noteContent.trim()) return;

    onUpdateNote(noteId, {
      content: noteContent,
      noteType,
      visibility: noteVisibility,
      updatedAt: new Date().toISOString(),
    });

    setEditingNote(null);
    setNoteContent('');
  };

  const startEditing = (note: Note) => {
    setEditingNote(note.id);
    setNoteContent(note.content);
    setNoteType(note.noteType);
    setNoteVisibility(note.visibility);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNoteContent('');
    setNoteType('general');
    setNoteVisibility('team');
  };

  const getNoteTypeColor = (type: string) => {
    return NOTE_TYPES.find((t) => t.id === type)?.color || NOTE_TYPES[0].color;
  };

  const getNoteTypeLabel = (type: string) => {
    return NOTE_TYPES.find((t) => t.id === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h4 className="text-gray-900">Notes & Evaluation</h4>
        <button
          onClick={() => setShowAddNote(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Filters */}
      {notes.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Types</option>
            {NOTE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Authors</option>
            {uniqueAuthors.map((author: any) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 && !showAddNote ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No notes yet. Add your first evaluation note.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-2 ${
                note.isPinned
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${getNoteTypeColor(note.noteType)}`}>
                      {getNoteTypeLabel(note.noteType)}
                    </span>
                    {note.visibility === 'private' && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Private
                      </span>
                    )}
                    {note.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {note.authorName} • {note.createdAt}
                    {note.updatedAt && note.updatedAt !== note.createdAt && ' (edited)'}
                  </p>
                </div>

                {/* Actions */}
                {note.authorId === currentUserId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-yellow-600 text-yellow-600' : 'text-gray-400'}`} />
                    </button>
                    {note.canEdit && (
                      <>
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this note?')) {
                              onDeleteNote(note.id);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Note Content */}
              {editingNote === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as Note['noteType'])}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {NOTE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={noteVisibility}
                      onChange={(e) => setNoteVisibility(e.target.value as 'private' | 'team')}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="team">Team Visible</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Note Dialog */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-gray-900 mb-4">Add Evaluation Note</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Note Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as Note['noteType'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {NOTE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Note Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={6}
                  placeholder="Enter your evaluation notes here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Visibility</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="team"
                      checked={noteVisibility === 'team'}
                      onChange={(e) => setNoteVisibility(e.target.value as 'private' | 'team')}
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Team Visible</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="private"
                      checked={noteVisibility === 'private'}
                      onChange={(e) => setNoteVisibility(e.target.value as 'private' | 'team')}
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-1">
                      <EyeOff className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Private (Only You)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNoteContent('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
