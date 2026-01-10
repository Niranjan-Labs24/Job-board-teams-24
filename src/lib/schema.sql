-- Teams 24 Careers Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'recruiter',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job templates table
CREATE TABLE IF NOT EXISTS job_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'full-time',
  salary_min VARCHAR(50),
  salary_max VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table with slug for SEO
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'full-time',
  salary_min VARCHAR(50),
  salary_max VARCHAR(50),
  location VARCHAR(255),
  color VARCHAR(20) DEFAULT '#3B82F6',
  description TEXT,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closure_reason VARCHAR(100),
  application_deadline DATE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  template_id UUID REFERENCES job_templates(id) ON DELETE SET NULL,
  category VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(255),
  resume_url TEXT,
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  cover_letter TEXT,
  experience VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  stage VARCHAR(50) DEFAULT 'new',
  rating DECIMAL(3,2) DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate ratings table
CREATE TABLE IF NOT EXISTS candidate_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  max_score INTEGER DEFAULT 10,
  reviewer_id UUID REFERENCES users(id),
  reviewer_name VARCHAR(255),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate notes table
CREATE TABLE IF NOT EXISTS candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  author_name VARCHAR(255),
  note_type VARCHAR(50) DEFAULT 'general',
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  visibility VARCHAR(20) DEFAULT 'team',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_ratings_application_id ON candidate_ratings(application_id);
CREATE INDEX IF NOT EXISTS idx_notes_application_id ON candidate_notes(application_id);

-- Insert default admin user
INSERT INTO users (email, name, role) 
VALUES ('admin@jobboard.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample seed data (optional)
-- You can run this to add initial jobs

INSERT INTO jobs (slug, title, type, salary_min, salary_max, location, color, description, requirements, responsibilities, benefits, status, category, currency, application_deadline)
VALUES 
  ('full-stack-developer', 'Full Stack Developer', 'full-time', '200k', '400k', 'Remote', '#3B82F6', 
   'Build and maintain scalable web applications using modern technologies.',
   ARRAY['5+ years full-stack experience', 'React/Next.js expertise', 'Node.js/Python backend skills'],
   ARRAY['Design and implement features', 'Code reviews and mentoring', 'Collaborate with product team'],
   ARRAY['Health insurance', 'Stock options', 'Flexible hours'],
   'published', 'Engineering', 'USD', '2026-02-15'),
  
  ('senior-product-designer', 'Senior Product Designer', 'full-time', '250k', '400k', 'Bangalore, Karnataka', '#F97316',
   'Lead product design initiatives and create exceptional user experiences.',
   ARRAY['7+ years UX/UI design', 'Strong portfolio', 'Figma expertise'],
   ARRAY['Lead design projects', 'User research and testing', 'Design system maintenance'],
   ARRAY['Health insurance', 'Learning budget', 'Flexible work'],
   'published', 'Design', 'USD', NULL)
ON CONFLICT (slug) DO NOTHING;

-- RPC Function for incrementing applications count
CREATE OR REPLACE FUNCTION increment_applications_count(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE jobs 
  SET applications_count = applications_count + 1 
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
