// Job types
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'archived';
export type ClosureReason = 'filled' | 'cancelled' | 'budget' | 'deadline' | 'other';

export interface Job {
  id: string;
  slug: string;
  title: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary_min: string;
  salary_max: string;
  location: string;
  color: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: JobStatus;
  status_changed_at: string;
  closure_reason?: ClosureReason;
  application_deadline?: string;
  meta_title?: string;
  meta_description?: string;
  template_id?: string;
  category?: string;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

// Application types
export type ApplicationStatus = 'new' | 'screening' | 'interview_scheduled' | 'interview_complete' | 'offer_pending' | 'hired' | 'rejected' | 'on_hold';

export interface Application {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  resume_url?: string;
  linkedin?: string;
  portfolio?: string;
  cover_letter?: string;
  experience: string;
  status: ApplicationStatus;
  stage: string;
  rating: number;
  is_archived: boolean;
  applied_at: string;
  stage_changed_at: string;
  // Joined fields
  job_title?: string;
  job_slug?: string;
}

// Rating types
export interface CandidateRating {
  id: string;
  application_id: string;
  category: string;
  score: number;
  max_score: number;
  reviewer_id?: string;
  reviewer_name: string;
  comment?: string;
  created_at: string;
}

// Note types
export type NoteType = 'general' | 'phone_screen' | 'interview' | 'reference' | 'other';
export type NoteVisibility = 'private' | 'team';

export interface CandidateNote {
  id: string;
  application_id: string;
  author_id?: string;
  author_name: string;
  note_type: NoteType;
  content: string;
  is_pinned: boolean;
  visibility: NoteVisibility;
  created_at: string;
}

// Template types
export interface JobTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary_min: string;
  salary_max: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  created_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'recruiter' | 'hiring_manager';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to generate slug
export function generateSlug(title: string, id?: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (id) {
    slug = `${slug}-${id.slice(0, 8)}`;
  }
  
  return slug;
}
