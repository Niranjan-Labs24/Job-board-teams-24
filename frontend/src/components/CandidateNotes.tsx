'use client';

import { useState } from 'react';
import { Plus, Pin, Eye, EyeOff, Edit, Trash2, X, Filter, User } from 'lucide-react';

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
  { id: 'reference', label: 'Reference', color: 'bg-green-100 text-green-700' },
  { id: 'other', label: 'Other', color: 'bg-orange-100 text-orange-700' },
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    noteType: 'general' as Note['noteType'],
    content: '',
    visibility: 'team' as Note['visibility'],
    isPinned: false,
  });
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);

  const uniqueAuthors = [...new Set(notes.map(n => n.authorName))];

  const sortedAndFilteredNotes = notes
    .filter(note => {
      if (filterType && note.noteType !== filterType) return false;
      if (filterAuthor && note.authorName !== filterAuthor) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSubmit = () => {
    if (newNote.content.trim()) {
      onAddNote(newNote);
      setNewNote({
        noteType: 'general',
        content: '',
        visibility: 'team',
        isPinned: false,
      });
      setShowAddForm(false);
    }
  };

  const handleUpdate = () => {
    if (editingNote && editingNote.content.trim()) {
      onUpdateNote(editingNote.id, {
        content: editingNote.content,
        noteType: editingNote.noteType,
        visibility: editingNote.visibility,
      });
      setEditingNote(null);
    }
  };

  const getNoteTypeStyle = (type: Note['noteType']) => {
    return NOTE_TYPES.find(t => t.id === type)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notes & Evaluation</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center text-sm">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="">All Types</option>
          {NOTE_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
        <select
          value={filterAuthor || ''}
          onChange={(e) => setFilterAuthor(e.target.value || null)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="">All Authors</option>
          {uniqueAuthors.map(author => (
            <option key={author} value={author}>{author}</option>
          ))}
        </select>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {sortedAndFilteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg border ${
              note.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getNoteTypeStyle(note.noteType)}`}>
                  {NOTE_TYPES.find(t => t.id === note.noteType)?.label}
                </span>
                {note.isPinned && (
                  <Pin className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                )}
                {note.visibility === 'private' && (
                  <EyeOff className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTogglePin(note.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className={`w-4 h-4 ${note.isPinned ? 'text-yellow-600 fill-yellow-600' : 'text-gray-400'}`} />
                </button>
                {note.canEdit && (
                  <>
                    <button
                      onClick={() => setEditingNote(note)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-2">{note.content}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>{note.authorName}</span>
              <span>•</span>
              <span>{note.createdAt}</span>
            </div>
          </div>
        ))}

        {sortedAndFilteredNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notes yet. Add a note to start tracking candidate evaluation.
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Note</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                <select
                  value={newNote.noteType}
                  onChange={(e) => setNewNote(prev => ({ ...prev, noteType: e.target.value as Note['noteType'] }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {NOTE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Write your note..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNote.visibility === 'private'}
                    onChange={(e) => setNewNote(prev => ({ ...prev, visibility: e.target.checked ? 'private' : 'team' }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Private (only visible to you)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNote.isPinned}
                    onChange={(e) => setNewNote(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Pin note</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!newNote.content.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Note</h3>
              <button onClick={() => setEditingNote(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                <select
                  value={editingNote.noteType}
                  onChange={(e) => setEditingNote(prev => prev ? { ...prev, noteType: e.target.value as Note['noteType'] } : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {NOTE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingNote(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
