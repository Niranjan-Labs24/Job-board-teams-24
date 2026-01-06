# Teams 24 Careers - Product Requirements Document

## Overview
A full-stack job board application built with **Next.js** (frontend + API), **TypeScript**, and **Supabase** (PostgreSQL). Designed for **Vercel deployment**.

## Original Problem Statement
Build a modern job board with:
- Public, SEO-optimized job listings
- Job-centric admin dashboard for recruiters
- Kanban-style application pipeline
- Social sharing capabilities
- Fully serverless architecture (Next.js API routes)

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (no separate backend!)
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel + Supabase

## Architecture
```
/app/                          # Root - Single deployable unit
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API Routes (serverless)
│   │   │   ├── jobs/         # CRUD for jobs
│   │   │   ├── applications/ # CRUD for applications
│   │   │   ├── templates/    # Job templates
│   │   │   ├── health/       # Health check
│   │   │   └── seed/         # Database seeding
│   │   ├── admin/
│   │   │   └── jobs/         # Job-Centric Admin Dashboard
│   │   │       ├── page.tsx  # Jobs list
│   │   │       └── [id]/     # Per-job applications view
│   │   ├── careers/          # SEO Job Pages
│   │   │   ├── page.tsx      # Job listings
│   │   │   └── [slug]/       # Individual job page
│   │   ├── page.tsx          # Landing page
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   └── ShareButton.tsx   # Social sharing component
│   └── lib/
│       ├── db.ts             # Supabase connection
│       ├── supabase.ts       # Supabase client
│       └── types.ts          # TypeScript definitions
├── package.json
├── .env.local                # Environment variables
└── .env.example              # Template for deployment
```

## Core Features

### ✅ Phase 1: Core Application (COMPLETE)
- [x] Job Listings Page
- [x] Admin Dashboard
- [x] Kanban Pipeline
- [x] Candidate Cards

### ✅ Phase 2: Job Management (COMPLETE)
- [x] Job CRUD Operations
- [x] Job Lifecycle (Draft → Published → Paused → Closed → Archived)
- [x] Job Templates
- [x] Application Deadlines

### ✅ Phase 3: Option A - Architecture (COMPLETE)
- [x] **Job-Centric Admin Dashboard** (`/admin/jobs`)
- [x] **Per-Job Applications View** (`/admin/jobs/[id]`)
- [x] **SEO-Optimized Job Pages** (`/careers/[slug]`)
- [x] **Social Sharing** (LinkedIn, Twitter, Facebook, Email, Copy Link)

### ✅ Phase 4: Database Migration (COMPLETE)
- [x] PostgreSQL schema
- [x] Removed MongoDB dependency
- [x] Removed separate FastAPI backend
- [x] Connected to Supabase cloud database

### ✅ Phase 5: Project Restructuring (COMPLETE - Jan 6, 2026)
- [x] Moved project from `/app/frontend` to `/app` root
- [x] Connected to Supabase PostgreSQL
- [x] Ready for Vercel deployment

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/jobs | List all jobs |
| POST | /api/jobs | Create job |
| GET | /api/jobs/:id | Get job by ID or slug |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |
| GET | /api/applications | List applications |
| POST | /api/applications | Create application |
| PUT | /api/applications/:id | Update application |
| GET | /api/templates | List templates |
| POST | /api/templates | Create template |

## Deployment

### Vercel Deployment
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Configuration
- **Project URL**: `https://fgelafnlezxfpptosovb.supabase.co`
- **Database**: PostgreSQL with full schema applied

## Next Steps / Backlog

### P1 - High Priority
- [ ] Add Supabase Auth (replace mock auth)
- [ ] Drag-and-drop Kanban
- [ ] Email notifications (Resend/SendGrid)
- [ ] Interview scheduling

### P2 - Medium Priority
- [ ] Analytics dashboard
- [ ] Email templates
- [ ] Resume file upload (Supabase Storage)

### P3 - Low Priority
- [ ] LinkedIn auto-import
- [ ] AI resume parsing
- [ ] Multi-tenant support

## Changelog

### January 6, 2026 (Latest)
- ✅ Connected to Supabase cloud database
- ✅ Restructured project from `/app/frontend` to `/app` root
- ✅ All API routes working with Supabase REST API
- ✅ Ready for Vercel deployment

### January 6, 2026 (Earlier)
- ✅ Fixed Create Job CTA
- ✅ Created demo jobs
- ✅ Added Share feature
- ✅ PostgreSQL migration from MongoDB
- ✅ Job-Centric Admin Dashboard
- ✅ SEO-optimized job pages
