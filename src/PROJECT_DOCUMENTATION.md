PRODUCT REQUIREMENTS DOCUMENT

Teams 24 Careers
Job Board Application

Version 2.0 - Feature Enhancement Release
December 30, 2025

Prepared for: Teams 24
Document Owner: Niranjan

 
Table of Contents

1. Executive Summary
2. Feature 1: Kanban Pipeline View
3. Feature 2: Bulk Actions System
4. Feature 3: Candidate Scoring & Notes
5. Feature 4: Advanced Search & Filters
6. Feature 5: Job Lifecycle Management
7. Feature 6: Job Templates
8. Feature 7: Application Deadline & Auto-Close
9. Feature 8: Email Notification System
10. Feature 9: Email Templates
11. Feature 10: Interview Scheduling
12. Feature 11: LinkedIn Profile Auto-Import
13. Feature 12: Analytics Dashboard
14. Database Schema Updates
15. Implementation Roadmap

16. Executive Summary

1.1 Document Purpose
This Product Requirements Document outlines the feature enhancements for the Teams 24 Careers job board application. The document provides detailed specifications for each feature, enabling incremental development while maintaining system coherence.

1.2 Product Vision
Transform the Teams 24 Careers platform from a basic job board into a comprehensive hiring management system that streamlines recruitment workflows, improves candidate tracking, and provides actionable insights through analytics.

1.3 Target Users
• HR Team: Primary users managing job postings and reviewing applications
• Hiring Managers: Reviewing candidates, providing feedback, conducting interviews
• Candidates: Applying for positions through the public interface
• Admin: System configuration and user management

1.4 Success Metrics
• Reduce time-to-hire by 30% through streamlined workflows
• Increase candidate processing efficiency by 50% via bulk actions
• Achieve 90% adoption of the Kanban pipeline view within 30 days
• Reduce missed follow-ups by 80% through automated notifications

  2. Feature 1: Kanban Pipeline View

2.1 Overview
Feature Name: Kanban-Style Candidate Pipeline
Priority: High (P0)
Estimated Effort: 2-3 weeks
Dependencies: Candidate status system, Drag-and-drop library

2.2 Problem Statement
The current table-based view of applications lacks visual clarity for understanding the hiring pipeline. HR managers cannot quickly assess how many candidates are at each stage or identify bottlenecks in the process.

2.3 Solution Description
Implement a Kanban board interface where each column represents a hiring stage. Candidates appear as cards that can be dragged between columns to update their status. This provides an immediate visual snapshot of the entire hiring funnel.

2.4 Pipeline Stages

Stage Description Card Color
New Freshly submitted applications awaiting initial review Blue (#3B82F6)
Screening Applications under preliminary evaluation Yellow (#F59E0B)
Interview Scheduled Candidates with confirmed interview appointments Purple (#8B5CF6)
Interview Complete Candidates who have completed interviews Indigo (#6366F1)
Offer Pending Candidates being considered for an offer Cyan (#06B6D4)
Hired Candidates who accepted the offer Green (#10B981)
Rejected Candidates not moving forward Red (#EF4444)
On Hold Candidates temporarily paused in the process Gray (#6B7280)

2.5 Functional Requirements

2.5.1 Board Layout

1. Display all pipeline stages as vertical columns arranged horizontally
2. Show candidate count in each column header (e.g., 'Screening (12)')
3. Enable horizontal scrolling when columns exceed viewport width
4. Allow collapsing/expanding individual columns
5. Support column reordering via drag-and-drop (admin only)

2.5.2 Candidate Cards

1. Display candidate name, applied position, and application date
2. Show star rating (1-5) if assigned
3. Display small avatar/initials for visual identification
4. Show 'days in stage' indicator for time-sensitive tracking
5. Include quick-action icons (view details, send email, add note)
6. Support card selection (checkbox) for bulk actions

2.5.3 Drag and Drop

1. Enable dragging cards between columns to change status
2. Show visual drop indicators when hovering over valid targets
3. Prompt for confirmation when moving to 'Rejected' or 'Hired'
4. Update database immediately upon drop with optimistic UI update
5. Log status change to activity history

2.6 User Interface Specifications

2.6.1 Desktop View (1280px+)
• All columns visible with horizontal scroll if needed
• Minimum column width: 280px
• Card height: Auto (minimum 80px)
• Maximum 10 visible cards per column before scrolling

2.6.2 Tablet View (768px - 1279px)
• Show 3-4 columns with horizontal swipe navigation
• Column selector dropdown for quick navigation

2.6.3 Mobile View (<768px)
• Single column view with stage selector tabs
• Swipe between stages
• Long-press to initiate drag for status change

2.7 Technical Specifications
Recommended Library: react-beautiful-dnd or @dnd-kit/core
State Management: Local state with Supabase real-time subscriptions
Performance: Virtual scrolling for columns with 50+ candidates

2.8 Database Changes
Add 'pipeline_stage' column to applications table with enum values matching the defined stages. Add 'stage_changed_at' timestamp for tracking time in stage.

2.9 Acceptance Criteria
• All 8 pipeline stages display as columns with accurate candidate counts
• Drag-and-drop updates candidate status within 500ms
• Board is responsive across all device sizes
• Status changes are logged in activity history
• Toggle view between Kanban and table available

  3. Feature 2: Bulk Actions System

3.1 Overview
Feature Name: Bulk Candidate Actions
Priority: High (P0)
Estimated Effort: 1-2 weeks
Dependencies: Kanban Pipeline View, Email Templates

3.2 Problem Statement
Processing candidates individually is time-consuming when dealing with high application volumes. HR managers need to perform the same action on multiple candidates efficiently.

3.3 Solution Description
Implement a bulk selection system allowing users to select multiple candidates and apply actions to all selected items simultaneously. Actions include status changes, sending emails, archiving, and exporting.

3.4 Available Bulk Actions

Action Description Confirmation Required
Move to Stage Change pipeline stage for all selected candidates Yes
Send Email Send templated email to all selected candidates Yes
Archive Move selected candidates to archive Yes
Add Tag Apply a tag/label to selected candidates No
Remove Tag Remove a tag from selected candidates No
Assign Reviewer Assign a team member to review candidates No
Export Download selected candidates as CSV/Excel No
Delete Permanently remove candidates (admin only) Yes (double)

3.5 Functional Requirements

3.5.1 Selection Mechanism

1. Checkbox on each candidate card/row for individual selection
2. 'Select All' checkbox in header to select all visible candidates
3. 'Select All in Stage' option within each Kanban column
4. Selection counter showing 'X candidates selected'
5. Shift+click for range selection
6. 'Clear Selection' button

3.5.2 Action Bar

1. Appears when one or more candidates are selected
2. Sticky positioning at bottom or top of viewport
3. Displays available actions as icon buttons with labels
4. Shows selection count
5. Animates in/out based on selection state

3.5.3 Confirmation & Feedback

1. Modal confirmation for destructive actions showing affected count
2. Progress indicator for batch processing
3. Success toast with undo option (30 second window)
4. Error handling with partial failure reporting

3.6 User Interface Specifications

3.6.1 Action Bar Design
• Height: 64px
• Background: Dark semi-transparent (#1a1a2e with 95% opacity)
• Position: Fixed bottom with 16px margin
• Border-radius: 12px
• Shadow: Large elevation shadow for prominence

3.7 Technical Specifications
Batch Size Limit: 100 candidates per operation
Processing: Async with database transactions
Undo Implementation: Soft delete with scheduled hard delete after 30 days

3.8 Acceptance Criteria
• Users can select 2-100 candidates simultaneously
• All 8 bulk actions function correctly
• Confirmation modals appear for destructive actions
• Undo functionality works within 30-second window
• Progress feedback displays during batch operations

  4. Feature 3: Candidate Scoring & Notes

4.1 Overview
Feature Name: Candidate Evaluation System
Priority: High (P1)
Estimated Effort: 1-2 weeks
Dependencies: Candidate profile system

4.2 Problem Statement
When reviewing multiple candidates for the same position, HR managers lack a standardized way to rate and compare applicants. Interview notes are often lost or stored in separate documents.

4.3 Solution Description
Implement a rating system with 1-5 stars and a notes section attached to each candidate profile. Support multiple notes from different team members with timestamps, creating a complete evaluation history.

4.4 Functional Requirements

4.4.1 Star Rating System

1. 5-star rating scale displayed as clickable/tappable stars
2. Support half-star ratings (e.g., 3.5 stars)
3. Display average rating when multiple reviewers rate same candidate
4. Show individual ratings with reviewer name on hover/click
5. Rating visible on candidate card in Kanban view
6. Rating history preserved when rating is updated

4.4.2 Rating Categories (Optional Advanced Feature)
Allow rating across multiple dimensions for comprehensive evaluation:

Category Description Weight
Technical Skills Relevant technical expertise and knowledge 30%
Experience Years and relevance of prior experience 25%
Communication Written and verbal communication ability 20%
Culture Fit Alignment with company values and team dynamics 15%
Overall Impression Holistic evaluation of candidate 10%

4.4.3 Notes System
• Rich text editor for note entry (bold, italic, bullet points)
• Note type selector: General, Phone Screen, Interview, Reference Check, Other
• Automatic timestamp and author attribution
• Edit/delete own notes (within 24 hours)
• Pin important notes to top of list
• @mention team members (triggers notification)
• Visibility toggle: Private (only me) or Team (all reviewers)

4.5 User Interface Specifications

4.5.1 Candidate Detail View - Evaluation Tab
• Star rating prominently displayed at top
• Category ratings in collapsible section (if enabled)
• Notes displayed in reverse chronological order
• Add Note button always visible (floating on mobile)
• Filter notes by type or author

4.6 Database Schema
New tables required:

candidate_ratings
• id (uuid, primary key)
• application_id (uuid, foreign key)
• reviewer_id (uuid, foreign key to users)
• rating (decimal 0-5)
• category (text, nullable for overall rating)
• created_at (timestamp)

candidate_notes
• id (uuid, primary key)
• application_id (uuid, foreign key)
• author_id (uuid, foreign key to users)
• note_type (enum: general, phone_screen, interview, reference, other)
• content (text)
• is_pinned (boolean)
• visibility (enum: private, team)
• created_at, updated_at (timestamps)

4.7 Acceptance Criteria
• Star ratings can be set from 0.5 to 5 in 0.5 increments
• Multiple team members can rate the same candidate
• Average rating displays correctly
• Notes save with proper attribution and timestamp
• Private notes visible only to author
• @mentions trigger notifications

  5. Feature 4: Advanced Search & Filters

5.1 Overview
Feature Name: Advanced Candidate Search & Filtering
Priority: High (P1)
Estimated Effort: 1-2 weeks
Dependencies: Candidate database, Rating system

5.2 Problem Statement
Finding specific candidates among hundreds of applications is difficult. The current status-based filtering is insufficient for targeted searches.

5.3 Solution Description
Implement comprehensive search and filtering capabilities allowing users to find candidates by name, email, phone, position, date range, rating score, and more.

5.4 Search Capabilities

5.4.1 Quick Search Bar
• Global search across: Name, Email, Phone, Position title
• Real-time results as user types (debounced 300ms)
• Recent searches saved for quick access
• Search history clearable

5.4.2 Advanced Filters

Filter Type Options
Position Multi-select dropdown All active job postings
Pipeline Stage Multi-select dropdown All 8 stages
Rating Score Range slider 0-5 stars
Applied Date Date range picker Start date, End date
Tags Multi-select dropdown All available tags
Assigned To Multi-select dropdown Team members
Source Multi-select dropdown Direct, LinkedIn, Referral, etc.
Has Resume Toggle Yes/No
Has Notes Toggle Yes/No

5.4.3 Saved Filters
• Save current filter combination with a name
• Load saved filters from dropdown
• Share filters with team
• Delete saved filters

5.5 User Interface Specifications

5.5.1 Filter Panel
• Collapsible side panel or dropdown
• Active filter count badge on filter button
• Clear all filters button
• Active filters shown as removable chips

5.6 Acceptance Criteria
• Search returns results within 500ms
• All filter types function correctly
• Multiple filters can be combined
• Saved filters persist across sessions
• Result count updates in real-time as filters change

  6. Feature 5: Job Lifecycle Management

6.1 Overview
Feature Name: Job Posting Lifecycle States
Priority: High (P1)
Estimated Effort: 1 week
Dependencies: Jobs database table

6.2 Problem Statement
Jobs currently only have an 'is_active' boolean which doesn't capture the full lifecycle of a job posting. There's no way to temporarily pause a posting or distinguish between archived historical data and actively closed positions.

6.3 Solution Description
Implement a comprehensive job lifecycle state system with five distinct states, allowing better management of job postings throughout their existence.

6.4 Job States

State Public Visibility Accepts Applications Description
Draft No No Job being created/edited, not ready for publishing
Published Yes Yes Live job accepting applications
Paused No No Temporarily hidden, data preserved, can resume
Closed No No No longer accepting applications, position filled or cancelled
Archived No No Historical record, hidden from active lists

6.5 Functional Requirements

6.5.1 State Transitions
• Draft → Published: Requires all mandatory fields complete
• Published → Paused: Instant, with optional reason
• Paused → Published: Instant resume
• Published/Paused → Closed: With closure reason (Filled, Cancelled, Budget)
• Closed → Archived: Move to historical records
• Archived → Draft: Clone for new posting (creates copy)

6.5.2 Admin Interface
• Job list shows state with color-coded badges
• Filter jobs by state
• Quick actions: Pause, Close, Archive from list view
• Job detail page shows state history/audit log

6.6 Database Changes
• Replace 'is_active' with 'status' enum (draft, published, paused, closed, archived)
• Add 'status_changed_at' timestamp
• Add 'closure_reason' (filled, cancelled, budget, other)
• Add 'job_state_history' table for audit trail

6.7 Acceptance Criteria
• All 5 job states implemented and functional
• State transitions follow defined rules
• Only Published jobs visible on public site
• State change history visible in admin

  7. Feature 6: Job Templates

7.1 Overview
Feature Name: Reusable Job Posting Templates
Priority: Medium (P2)
Estimated Effort: 1 week
Dependencies: Job Lifecycle Management

7.2 Problem Statement
Creating job postings from scratch is time-consuming, especially for frequently hired positions. Consistency across similar job postings is hard to maintain.

7.3 Solution Description
Create a template system where common job configurations can be saved and reused. Templates include pre-filled requirements, responsibilities, salary ranges, and other job details.

7.4 Functional Requirements

7.4.1 Template Management
• Create template from scratch with all job fields
• Save existing job as template
• Edit existing templates
• Delete templates (soft delete)
• Categorize templates (Engineering, Design, Operations, etc.)

7.4.2 Template Content
Templates should store:
• Job title (editable placeholder)
• Job type (Full-time, Part-time, Contract, Internship)
• Default salary range
• Location options
• Job description
• Requirements list
• Responsibilities list
• Benefits/perks section

7.4.3 Using Templates
• 'Create from Template' button on job list page
• Template selector with preview
• All fields editable after template applied
• Clear indication that job was created from template

7.5 Default Templates
Pre-populate system with common templates for Teams 24:
• Full Stack Developer
• Frontend Developer
• Backend Developer
• UI/UX Designer
• Social Media Designer
• DevOps Engineer
• Project Manager
• HR Coordinator
• Intern (Generic)

7.6 Acceptance Criteria
• Templates can be created, edited, and deleted
• Existing jobs can be saved as templates
• New jobs can be created from templates
• Default templates available on fresh install

  8. Feature 7: Application Deadline & Auto-Close

8.1 Overview
Feature Name: Job Application Deadline System
Priority: Medium (P2)
Estimated Effort: 3-4 days
Dependencies: Job Lifecycle Management

8.2 Problem Statement
Jobs remain open indefinitely, requiring manual intervention to close them. Candidates have no visibility into application deadlines, leading to uncertainty.

8.3 Solution Description
Add optional deadline dates to job postings. Display deadline prominently to candidates. Automatically transition job status when deadline passes.

8.4 Functional Requirements

8.4.1 Deadline Configuration
• Optional deadline field when creating/editing job
• Date picker with minimum date = today
• Optional time component (default: end of day 11:59 PM)
• Timezone handling (use company timezone setting)
• Option to extend deadline after setting

8.4.2 Public Display
• Show 'Apply by [date]' on job card and detail page
• Urgent indicator when deadline within 3 days
• 'Last day to apply!' badge on final day
• Countdown timer on job detail page (optional)

8.4.3 Auto-Close Behavior
• Cron job runs every hour to check deadlines
• Jobs past deadline automatically moved to 'Closed' status
• Closure reason set to 'deadline_reached'
• Admin notification sent when job auto-closes
• Application form disabled after deadline (with message)

8.5 Database Changes
• Add 'application_deadline' (timestamp, nullable) to jobs table
• Add 'auto_closed' (boolean) to indicate automatic closure

8.6 Acceptance Criteria
• Deadlines can be set and edited on job postings
• Deadline displays correctly on public job pages
• Jobs auto-close within 1 hour of deadline passing
• Applications cannot be submitted after deadline

  9. Feature 8: Email Notification System

9.1 Overview
Feature Name: Automated Email Notifications
Priority: High (P1)
Estimated Effort: 2 weeks
Dependencies: Email service provider (Resend, SendGrid, or AWS SES)

9.2 Problem Statement
There's no automated communication with candidates or internal notifications for HR. Manual email sending is time-consuming and prone to being forgotten.

9.3 Solution Description
Implement an automated email notification system that sends emails at key points in the hiring process, both to candidates and internal team members.

9.4 Notification Types

9.4.1 Candidate Notifications

Trigger Email Type Timing
Application submitted Confirmation email Immediate
Status changed to Screening Under review notification Immediate
Status changed to Interview Interview invite Manual trigger
Interview scheduled Calendar invite + details When scheduled
Interview reminder Reminder email 24 hours before
Status changed to Rejected Rejection email Manual or auto
Status changed to Offer Offer notification Manual trigger
Status changed to Hired Welcome email Manual trigger

9.4.2 Admin/HR Notifications

Trigger Recipients Email Content
New application received Job poster, HR team Candidate summary with quick link
High-rated candidate Hiring manager Alert for 4+ star candidates
Deadline approaching Job poster Jobs closing in 3 days
Job auto-closed Job poster Notification with application count
Interview feedback due Interviewer Reminder after 48 hours
Candidate waiting too long HR team Candidates in stage >7 days

9.5 Functional Requirements

9.5.1 Email Configuration
• Toggle individual notification types on/off
• Configure recipients for admin notifications
• Set company branding (logo, colors) for email templates
• Configure 'from' email address and name
• Email preview before sending (for manual triggers)

9.5.2 Email Tracking
• Log all sent emails with timestamp and recipient
• Track delivery status (sent, delivered, bounced)
• Track open rates (optional)
• View email history per candidate

9.6 Technical Implementation
Recommended Provider: Resend (modern API, good deliverability, React email support)
Alternative: SendGrid or AWS SES for high volume
Template Engine: React Email for component-based templates
Queue System: Supabase Edge Functions with cron for scheduled emails

9.7 Database Schema
New table: email_logs
• id (uuid)
• application_id (uuid, nullable)
• recipient_email (text)
• email_type (enum)
• subject (text)
• status (sent, delivered, bounced, failed)
• sent_at (timestamp)
• opened_at (timestamp, nullable)

9.8 Acceptance Criteria
• All candidate notification types functional
• All admin notification types functional
• Notification preferences configurable
• Email logs viewable in admin panel
• Emails delivered within 1 minute of trigger

  10. Feature 9: Email Templates

10.1 Overview
Feature Name: Customizable Email Templates
Priority: Medium (P2)
Estimated Effort: 1 week
Dependencies: Email Notification System

10.2 Problem Statement
Fixed email content doesn't allow personalization or brand voice consistency. Different situations require different tones and messaging.

10.3 Solution Description
Create an email template management system where HR can customize default templates or create new ones for various scenarios.

10.4 Default Templates

10.4.1 Application Received
Subject: Thanks for applying to [Job Title] at Teams 24
Content: Confirmation of receipt, expected timeline, next steps

10.4.2 Under Review
Subject: Your application is being reviewed
Content: Status update, reassurance, timeline

10.4.3 Interview Invitation
Subject: Interview Invitation - [Job Title] at Teams 24
Content: Congratulations, scheduling link/options, preparation tips

10.4.4 Interview Reminder
Subject: Reminder: Your interview tomorrow
Content: Time, location/link, interviewer names, tips

10.4.5 Rejection (After Application)
Subject: Update on your application to Teams 24
Content: Gracious decline, encouragement, future opportunities

10.4.6 Rejection (After Interview)
Subject: Following up on your interview
Content: Personalized decline, specific feedback (optional), warm close

10.4.7 Offer Letter
Subject: Congratulations! Offer from Teams 24
Content: Excitement, role details, compensation, next steps

10.5 Template Variables
Available merge fields for personalization:

Variable Description Example
{{candidate_name}} Full name of candidate John Doe
{{candidate_first_name}} First name only John
{{job_title}} Position title Full Stack Developer
{{company_name}} Company name Teams 24
{{application_date}} Date applied December 28, 2025
{{interview_date}} Scheduled interview date January 5, 2026
{{interview_time}} Scheduled interview time 2:00 PM IST
{{interviewer_name}} Name of interviewer Sarah Smith
{{job_location}} Job location Chennai / Remote
{{salary_range}} Compensation range ₹8L - ₹12L

10.6 Functional Requirements
• WYSIWYG editor for template creation/editing
• Variable insertion button with available options
• Preview with sample data
• Send test email to self
• Version history for templates
• Duplicate existing template
• Reset to default option

10.7 Acceptance Criteria
• All 7 default templates available and functional
• Templates can be edited and saved
• All merge fields populate correctly
• Preview shows accurate rendering
• Test emails can be sent

  11. Feature 10: Interview Scheduling

11.1 Overview
Feature Name: Built-in Interview Scheduler
Priority: Medium (P2)
Estimated Effort: 2-3 weeks
Dependencies: Email Notification System, Calendar integration (optional)

11.2 Problem Statement
Scheduling interviews involves back-and-forth emails to find mutually available times. This is inefficient and delays the hiring process.

11.3 Solution Description
Implement a scheduling system where HR can propose time slots and candidates can select their preferred time. Optionally integrate with Google Calendar for availability checking.

11.4 Functional Requirements

11.4.1 Slot Proposal (HR Side)
• Select candidate to schedule
• Choose interviewer(s)
• Propose multiple time slots (minimum 3 recommended)
• Set interview duration (30 min, 45 min, 60 min)
• Add interview type (Phone, Video, In-person)
• Include meeting link or location
• Add optional notes for candidate

11.4.2 Slot Selection (Candidate Side)
• Email with scheduling link sent to candidate
• Simple interface showing available slots
• Click to select preferred time
• Confirmation page with calendar download (.ics)
• Option to request different times

11.4.3 Confirmation & Reminders
• Automatic confirmation email to candidate and interviewer
• Calendar invite attachment (.ics)
• Reminder email 24 hours before
• Reminder email 1 hour before
• Reschedule/cancel option for both parties

11.5 Calendar Integration (Optional Enhancement)
• Connect Google Calendar via OAuth
• Auto-check interviewer availability
• Suggest only available time slots
• Create calendar event automatically when booked

11.6 Database Schema
New table: interviews
• id (uuid)
• application_id (uuid, foreign key)
• interviewer_id (uuid, foreign key to users)
• scheduled_at (timestamp)
• duration_minutes (integer)
• type (phone, video, in_person)
• meeting_link (text, nullable)
• location (text, nullable)
• status (pending, confirmed, completed, cancelled, no_show)
• candidate_notes (text, nullable)

New table: interview_slots (for proposed slots)
• id (uuid)
• interview_id (uuid, foreign key)
• proposed_time (timestamp)
• is_selected (boolean)

11.7 Acceptance Criteria
• HR can propose multiple time slots for interviews
• Candidates can select from proposed slots via email link
• Confirmation emails sent to all parties
• Calendar .ics file downloadable
• Reminder emails sent automatically

  12. Feature 11: LinkedIn Profile Auto-Import

12.1 Overview
Feature Name: LinkedIn Profile Data Parser
Priority: Low (P3)
Estimated Effort: 1-2 weeks
Dependencies: Application form

12.2 Problem Statement
Candidates must manually enter information that already exists on their LinkedIn profile. This creates friction and increases form abandonment.

12.3 Solution Description
When a candidate provides their LinkedIn URL, attempt to fetch publicly available data to pre-populate form fields. Note: Due to LinkedIn's restrictions, this works with limited data from public profiles.

12.4 Implementation Approach

12.4.1 Option A: Public Profile Scraping (Limited)
• Parse public LinkedIn profile URL
• Extract available public data (name, headline, location)
• Limitations: Most profile data is private, may break with LinkedIn changes

12.4.2 Option B: Third-Party API (Recommended)
• Use service like Proxycurl, People Data Labs, or Apollo
• More reliable data extraction
• Cost per lookup (~$0.01-$0.05 per profile)
• Higher accuracy and more data fields

12.5 Data Fields to Extract

LinkedIn Field Application Field Confidence
Full name First Name, Last Name High
Headline Professional summary High
Location City, Country High
Profile photo Candidate avatar Medium
Current company Current employer Medium
Current title Current role Medium
Email Email (if public) Low
Education Education history Medium

12.6 User Experience
• LinkedIn URL field at top of application form
• 'Import from LinkedIn' button next to URL field
• Loading indicator while fetching
• Fields auto-populate with imported data
• All fields remain editable after import
• Clear indication of which fields were imported
• Graceful fallback if import fails

12.7 Acceptance Criteria
• LinkedIn URL triggers import option
• Available data pre-populates form fields
• Import failure handled gracefully with manual entry fallback
• All imported fields editable by candidate

  13. Feature 12: Analytics Dashboard

13.1 Overview
Feature Name: Hiring Analytics & Reporting
Priority: Medium (P2)
Estimated Effort: 2-3 weeks
Dependencies: All other features (uses their data)

13.2 Problem Statement
Without analytics, it's impossible to measure hiring efficiency, identify bottlenecks, or make data-driven decisions about the recruitment process.

13.3 Solution Description
Build a comprehensive analytics dashboard showing key hiring metrics, funnel visualization, and trend analysis over time.

13.4 Key Metrics

13.4.1 Volume Metrics

Metric Description Visualization
Total Applications All applications in time period Big number + trend
Applications per Job Average and per-posting breakdown Bar chart
Applications by Source Direct, LinkedIn, Referral, etc. Pie chart
Active Candidates Candidates currently in pipeline Big number
Applications per Day/Week Volume trends over time Line chart

13.4.2 Funnel Metrics

Metric Description Visualization
Conversion Rate % moving between each stage Funnel diagram
Drop-off Points Where candidates fall out Highlighted funnel
Stage Distribution Candidates per pipeline stage Stacked bar
Stage-to-Stage Time Days between transitions Timeline

13.4.3 Efficiency Metrics

Metric Description Target
Time-to-Hire Days from application to hire < 30 days
Time-in-Stage Average days at each stage Varies by stage
Time-to-First-Response Days until first status change < 3 days
Interview-to-Offer Ratio % of interviewed candidates offered > 20%
Offer Acceptance Rate % of offers accepted > 80%

13.4.4 Quality Metrics

Metric Description Visualization
Average Candidate Rating Mean star rating across candidates Big number
Rating Distribution Breakdown by rating score Histogram
Top-Rated Sources Which sources produce best candidates Ranked list
Rejection Reasons Why candidates don't proceed Pie chart

13.5 Dashboard Sections

13.5.1 Overview Tab
• KPI cards: Total applications, Open positions, Time-to-hire, Hire rate
• Trend sparklines on each KPI
• Pipeline funnel visualization
• Recent activity feed

13.5.2 Pipeline Tab
• Detailed funnel with conversion rates between stages
• Stage-by-stage analysis
• Bottleneck identification (stages with longest time)
• Comparison: This period vs. last period

13.5.3 Sources Tab
• Application volume by source
• Conversion rate by source
• Quality rating by source
• Cost-per-hire by source (if applicable)

13.5.4 Time Analysis Tab
• Time-to-hire trend over time
• Average time at each pipeline stage
• Candidates stuck too long (alerts)
• Best/worst performing months

13.6 Filters & Controls
• Date range selector (preset: 7d, 30d, 90d, YTD, Custom)
• Filter by job position
• Filter by source
• Export to PDF/CSV
• Schedule automated reports (weekly email)

13.7 Technical Implementation
Charting Library: Recharts (React) or Chart.js
Data Aggregation: PostgreSQL materialized views for performance
Caching: Cache computed metrics, refresh every 15 minutes
Export: jsPDF for PDF, Papa Parse for CSV

13.8 Acceptance Criteria
• All defined metrics displayed accurately
• Charts render correctly with real data
• Filters affect all displayed metrics
• Dashboard loads within 3 seconds
• Export functions work for PDF and CSV

  14. Database Schema Updates

14.1 Summary of Database Changes
The following database modifications are required to support all new features. These should be implemented incrementally alongside feature development.

14.2 Modified Tables

14.2.1 jobs (Updated)
• status: enum (draft, published, paused, closed, archived) - replaces is_active
• status_changed_at: timestamp
• closure_reason: enum (filled, cancelled, budget, deadline, other)
• application_deadline: timestamp (nullable)
• template_id: uuid (nullable, foreign key)

14.2.2 applications (Updated)
• pipeline_stage: enum (new, screening, interview_scheduled, interview_complete, offer_pending, hired, rejected, on_hold)
• stage_changed_at: timestamp
• source: enum (direct, linkedin, referral, job_board, other)
• is_archived: boolean
• assigned_to: uuid (nullable, foreign key to users)

14.3 New Tables

14.3.1 candidate_ratings
Stores individual ratings from reviewers

14.3.2 candidate_notes
Stores evaluation notes with type, visibility, and pinning

14.3.3 job_templates
Stores reusable job posting templates

14.3.4 email_templates
Stores customizable email templates

14.3.5 email_logs
Tracks all sent emails with delivery status

14.3.6 interviews
Stores scheduled interviews with status and details

14.3.7 interview_slots
Stores proposed time slots for interview scheduling

14.3.8 saved_filters
Stores user-created filter combinations

14.3.9 activity_log
Audit trail for all significant actions

14.3.10 application_tags
Many-to-many relationship for candidate tagging

  15. Implementation Roadmap

15.1 Phase 1: Core Admin Enhancements (Weeks 1-4)
Focus: Transform the admin experience with pipeline visualization and efficiency tools

Week Feature Effort Priority
1-2 Kanban Pipeline View 2 weeks P0
2-3 Bulk Actions System 1.5 weeks P0
3-4 Candidate Scoring & Notes 1.5 weeks P1
4 Advanced Search & Filters 1 week P1

15.2 Phase 2: Job Management (Weeks 5-6)
Focus: Better job posting lifecycle and efficiency

Week Feature Effort Priority
5 Job Lifecycle Management 1 week P1
5-6 Job Templates 1 week P2
6 Application Deadline & Auto-Close 0.5 weeks P2

15.3 Phase 3: Communication (Weeks 7-10)
Focus: Automated candidate and admin communication

Week Feature Effort Priority
7-8 Email Notification System 2 weeks P1
9 Email Templates 1 week P2
9-10 Interview Scheduling 2 weeks P2

15.4 Phase 4: Enhancements & Analytics (Weeks 11-14)
Focus: Polish and insights

Week Feature Effort Priority
11 LinkedIn Profile Auto-Import 1 week P3
12-14 Analytics Dashboard 2.5 weeks P2
14 Testing & Bug Fixes 1 week -

15.5 Total Estimated Timeline
Duration: 14 weeks (3.5 months)
Start Date: January 2026
Target Completion: April 2026

15.6 Dependencies & Prerequisites
• Supabase project setup with authentication configured
• Email service provider account (Resend recommended)
• LinkedIn API or Proxycurl account (for Phase 4)
• Design system and component library finalized

 

End of Document

Teams 24 Careers - Product Requirements Document
Version 2.0 | December 30, 2025

For questions or clarifications, contact the product team.