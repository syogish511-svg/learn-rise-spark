# Learn Rise Spark

BUILD A COMPLETE, PREMIUM, AI-POWERED STUDENT PROGRESS TRACKING WEBSITE

School Name: SRI RAMAKRISHNA SHARADADEVI VIDYAMANDIRA
Board: ICSE
Class: 10
Primary Focus: Mathematics learning, daily work monitoring, academic progress, and examination preparation.

Build a fully functional, modern educational web application for Class 10 ICSE students. This must be a real working website with a database, secure authentication, cloud storage, AI integration, progress analytics, and automated notifications. Do not build only a static landing page or a basic dashboard.

==================================================

CREATIVE DESIGN AND VISUAL IDENTITY
==================================================

Create a premium, visually stunning educational platform for SRI RAMAKRISHNA SHARADADEVI VIDYAMANDIRA.

The design must look like a professional, modern EdTech product rather than a typical school website template.

Design requirements:

Elegant navy blue, royal blue, white, and teal colour palette with subtle gold accents.

Beautiful gradient backgrounds, soft shadows, rounded cards, modern icons, and subtle animations.

Attractive academic dashboard with progress rings, charts, achievement badges, and activity timelines.

A premium welcome section displaying the school name and ICSE Class 10.

A visually engaging examination countdown when an official examination date is available.

Modern sidebar navigation with clear icons.

Interactive cards, progress indicators, notification panels, and file previews.

Smooth transitions, hover effects, and loading animations.

Responsive design for desktop, tablet, and mobile.

Dark mode and light mode.

Attractive empty states and meaningful success and error messages.

Use a consistent design system throughout the application. Make the dashboard information-rich but not cluttered. Use real data rather than permanent placeholder statistics.

Display the school name prominently:

SRI RAMAKRISHNA SHARADADEVI VIDYAMANDIRA

CLASS 10 | ICSE BOARD

Tagline: Learn Every Day. Improve Every Week. Achieve Excellence.

Create separate role-based dashboards.

A. ADMIN / TEACHER

The teacher must have complete authorized control over academic content and student monitoring.

The teacher can:

Add, edit, and deactivate student accounts.

Assign unique student IDs and reset passwords.

Create classes, subjects, chapters, and assignments.

Upload PDFs, notes, worksheets, question papers, solutions, and study materials.

Add external educational links and video links.

Set assignment deadlines and marks.

Review student submissions.

Record test marks and teacher feedback.

Monitor every student's activity and academic progress.

Manage school announcements and notification settings.

Approve AI-proposed website changes.

View reports and export records.

B. STUDENT

Students log in using their Student ID and password.

Students can:

View assigned daily work.

Upload completed assignments as PDFs.

Access teacher-uploaded study materials.

Open approved learning links.

Ask the AI tutor academic questions.

View their own progress, marks, pending work, and feedback.

Track assignment deadlines and completed work.

View their personal activity history.

Students must never be able to change their marks, other students' records, teacher settings, or school announcements.

C. OPTIONAL PARENT VIEW

Parents can access only their linked child's academic progress, pending work, test marks, and notifications.

Create a beautiful digital resource library.

The teacher must be able to upload:

PDF study materials.

Chapter notes.

Mathematics worksheets.

Homework sheets.

Practice question papers.

Previous ICSE question papers.

Model papers and specimen papers.

Answer keys and worked solutions.

Images and diagrams.

Educational videos or external learning links.

Every resource should contain:

Subject.

Chapter or topic.

Resource title.

Description.

Upload date.

Class.

Resource type.

Visibility settings.

Organise resources by subject and chapter.

Include search, filters, previews, downloads, and recently uploaded materials.

Allow the teacher to publish a resource to all students, selected students, or selected assignments.

Store files in secure cloud storage. Students must access only resources they are authorised to view.

When the teacher uploads a new resource, it should automatically appear in the relevant student dashboard without editing the website code.

This is one of the most important modules.

Build a comprehensive system to determine whether each student is consistently working, submitting assignments, and improving academically.

The teacher should be able to:

Create daily assignments.

Assign work by subject, chapter, and student group.

Set due dates and maximum marks.

See who has submitted and who has not.

View uploaded PDFs and submission timestamps.

Review, accept, return, or request corrections.

Enter marks and written feedback.

Record late and missing submissions.

View daily, weekly, and monthly activity.

Each assignment must have these statuses:

Not started.

In progress, when supported by actual student activity.

Submitted.

Submitted late.

Under review.

Corrections required.

Reviewed.

Missing or overdue.

Do not assume a student is working just because the student is logged in.

Track meaningful activity, including:

Assignment submission frequency.

Number of assignments completed.

On-time submission percentage.

Missed deadlines.

Time and date of submissions.

Teacher-reviewed work.

Test results and changes in performance.

Progress across chapters.

Show the teacher a student engagement indicator based on actual recorded evidence.

Use categories such as:

Consistent.

Needs attention.

Frequently missing work.

Improving.

Academic support recommended.

Explain why a student is placed in a category. Do not label students as lazy or make unsupported conclusions about their effort.

Create a detailed student profile with:

Total assignments assigned.

Assignments submitted.

Pending assignments.

Missing assignments.

On-time submission percentage.

Subject-wise test marks.

Average marks and score trends.

Chapter-wise strengths and weaknesses.

Weekly and monthly progress charts.

Teacher remarks.

Recent activity timeline.

Recommended revision topics.

Create visually attractive graphs and progress rings.

Allow teachers to compare a student's current performance with their own earlier performance.

Allow filtering by date range, subject, chapter, assignment type, and class.

Generate individual student progress reports and class-wide summaries.

All statistics must be calculated from actual database records and update when teachers change marks or submission statuses.

Integrate an AI learning assistant using either the Google Gemini API or the OpenAI API.

Create a configurable AI settings page so the administrator can choose the supported provider, model, and appropriate features.

Do not hardcode API keys in the frontend.

Use secure server-side functions and environment secrets for all AI requests.

The AI tutor should:

Explain ICSE Class 10 Mathematics concepts.

Help students understand teacher-uploaded study materials.

Give step-by-step explanations.

Generate practice questions.

Provide hints before showing full solutions.

Create revision quizzes.

Identify topics a student should revise based on authorised progress records.

Explain mistakes in submitted work when the teacher enables this feature.

Answer questions using the teacher's approved resource library when relevant.

Use retrieval-based search over approved school materials where practical. Clearly distinguish answers grounded in uploaded resources from general AI knowledge.

The AI must not invent official ICSE dates, syllabus changes, or school announcements.

Provide separate permissions for student tutoring and teacher administration.

Create an AI-powered teacher control panel called:

AI SCHOOL WEBSITE MANAGER

The teacher should be able to type instructions in ordinary language to manage the website without manually editing code.

Example commands:

"Upload this mathematics worksheet and assign it to all Class 10 students."

"Create a quadratic equations assignment due tomorrow at 6 PM."

"Change the submission deadline for Assignment 12 to Monday."

"Add a new chapter called Probability to the Mathematics resource library."

"Publish this PDF only to students who scored below 50% in the last mathematics test."

"Update the homepage announcement to remind students about tomorrow's revision class."

"Create a report showing students who have missed three or more assignments this month."

"Add the marks from this authorised test spreadsheet to the student records."

"Show me the five students who need the most academic support this week, with the evidence for each recommendation."

"Change the dashboard theme to a blue-and-gold academic design."

Required behaviour:

Interpret the teacher's request.

Identify the relevant database records or website settings.

Prepare a structured list of proposed changes.

Show the teacher a preview of the changes.

Ask for confirmation before consequential changes.

Execute the approved operation through secure, predefined server-side functions.

Validate the result and show a success or failure report.

Maintain an audit log of who changed what and when.

Allow routine low-risk changes, such as draft announcements and resource descriptions, to be prepared quickly.

Require confirmation before deleting records, changing marks in bulk, sending messages to parents, publishing important notices, changing permissions, or making other consequential changes.

Never allow the AI to execute arbitrary database commands or modify application code directly in production.

If the teacher requests a new application feature that cannot be implemented through existing controls, explain what development work is required instead of pretending it has been completed.

The AI manager must be available only to authorised teachers and administrators.

Create an ICSE Updates Centre.

The purpose is to keep teachers and students informed about important official academic updates.

Monitor appropriate official sources for:

ICSE Class 10 examination timetable announcements.

Official specimen papers.

Syllabus and curriculum updates.

Examination regulations.

Official circulars.

Result announcements.

Other important Class 10 academic notices.

Prefer official CISCE sources, especially:
https://cisce.org/

Use official publications and links as the source of truth.

Implementation requirements:

Use a scheduled server-side checking process.

Use official RSS feeds or authorised APIs if available.

Otherwise, use a permitted and reliable retrieval method that respects website terms and access restrictions.

Verify the source, publication date, and relevance to ICSE Class 10.

Detect duplicate announcements.

Store the original source URL and a concise summary.

Display the date last checked.

Show the date of the official announcement.

Provide a direct link to the original notice.

Flag uncertain information for teacher review.

Allow teachers to approve, dismiss, or publish important updates.

Notify students and teachers when a verified, relevant update is available.

Never fabricate updates or display an unverified AI-generated announcement as an official CISCE notice.

If automated monitoring cannot access a source, show a clear status and provide a manual refresh option.

Do not claim that monitoring is running until the scheduled process has actually been configured and tested.

Integrate SMS and WhatsApp notifications for overdue assignments.

Allow the teacher to configure:

Reminder time.

Assignment deadline.

Grace period.

Notification channels.

Reminder frequency.

Parent contact information.

At the configured time, check the actual submission records.

Send a reminder only if the work remains missing after the deadline and grace period.

Record SMS and WhatsApp delivery statuses separately. Prevent duplicate reminders and support authorised retries for failures.

Use an approved SMS provider configured for Indian messaging requirements and the official WhatsApp Business Platform or an authorised provider.

Store API credentials securely on the server. Do not send messages until the required provider configuration, consent, registrations, and templates are ready.

Provide a test mode before contacting real parents.

Build a premium teacher dashboard displaying:

Total enrolled students.

Today's assignments.

Completed and missing submissions.

Submission completion rate.

Students requiring academic support.

Recent PDF uploads.

Latest test results.

Subject-wise performance.

Weekly submission trends.

Recent official ICSE updates.

AI-generated draft recommendations.

Parent notification delivery status.

Provide searchable tables and filters.

Allow reports to be exported as CSV and printable PDF reports where supported.

The teacher must be able to correct records and add new information without changing source code.

Use Lovable Cloud or Supabase for authentication, relational data, and private file storage.

Create appropriate data structures for:

User profiles and roles.

Student records.

Parent contacts and linked students.

Subjects and chapters.

Assignments.

PDF submissions.

Learning resources.

Test marks.

Teacher feedback.

Activity records.

AI requests and approved actions.

Official ICSE announcements.

SMS and WhatsApp notification logs.

Application settings and audit logs.

Use appropriate database relationships, validation, timestamps, and access policies.

Implement row-level security and server-side authorisation.

Students must access only their own submissions, marks, and authorised resources.

Parents must access only their linked child's records.

Teachers must have access only to the classes and records they are authorised to manage.

Protect personal information and uploaded documents.

Never expose private storage URLs, service-role keys, AI API keys, or messaging credentials publicly.

Use sensible upload limits, input validation, error handling, backups, and audit logging.

Build the real application in phases:

Phase 1:
Create the visual design, authentication, role-based dashboards, database, and cloud storage.

Phase 2:
Implement teacher uploads, daily assignments, PDF submissions, test marks, and progress analytics.

Phase 3:
Integrate the AI tutor and secure teacher AI command centre.

Phase 4:
Implement verified ICSE update monitoring and parent messaging integrations.

Phase 5:
Test security, responsive design, database updates, file access, scheduled jobs, AI actions, and notification delivery.

Use realistic test data only in a clearly identified demo environment.

Create a setup guide covering:

Creating the first administrator.

Adding student accounts.

Configuring cloud storage.

Connecting the AI provider.

Setting up official update monitoring.

Connecting SMS and WhatsApp.

Configuring scheduled jobs.

Deploying the application.

IMPORTANT:
Build a working application, not just a visual prototype. Every button and control must have a meaningful action. Clearly identify any feature that still requires API credentials, external registrations, deployment settings, or manual configuration.

The finished website should be attractive enough for a professional school demonstration, simple enough for teachers to operate, secure enough to protect student records, and flexible enough to support future changes through the teacher AI command centre.

Start building the application now. First establish the design system, database, and authentication, then implement each module in order. Do not replace required functionality with fake data or simulated success messages. add this logo on top

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://learn-rise-spark.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/43ec2b7e-8fcb-4622-8c2b-95eb301ade86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
