/*
# Ask a Doubt feature tables

Creates the doubt query and reply system for students to ask questions and staff to respond.

## New Tables
- doubt_queries: student questions with optional attachment, subject/chapter link, status tracking
- doubt_replies: responses from staff or the original student

## Security
- RLS enabled on both tables
- Students can read their own doubts; staff can read all
- Students insert only their own pending doubts
- Staff can update doubt status
- Replies readable by doubt owner and staff
- Replies insertable by author who can view the doubt (staff or student if not closed)
*/

create type public.doubt_status as enum ('pending','answered','closed');
create table public.doubt_queries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  title text not null,
  body text not null,
  attachment_path text,
  attachment_name text,
  status doubt_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.doubt_replies (
  id uuid primary key default gen_random_uuid(),
  doubt_id uuid not null references public.doubt_queries(id) on delete cascade,
  author_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.doubt_queries to authenticated;
grant select, insert on public.doubt_replies to authenticated;
grant all on public.doubt_queries, public.doubt_replies to service_role;
alter table public.doubt_queries enable row level security;
alter table public.doubt_replies enable row level security;
create or replace function public.can_view_doubt(_uid uuid, _doubt uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff(_uid) or exists (select 1 from public.doubt_queries d where d.id = _doubt and d.student_id = _uid)
$$;
create policy "doubts read" on public.doubt_queries for select to authenticated using (student_id = auth.uid() or public.is_staff(auth.uid()));
create policy "doubts student insert" on public.doubt_queries for insert to authenticated with check (student_id = auth.uid() and status = 'pending');
create policy "doubts staff update" on public.doubt_queries for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "doubt replies read" on public.doubt_replies for select to authenticated using (public.can_view_doubt(auth.uid(), doubt_id));
create policy "doubt replies insert" on public.doubt_replies for insert to authenticated
  with check (author_id = auth.uid() and public.can_view_doubt(auth.uid(), doubt_id) and
    (public.is_staff(auth.uid()) or exists (select 1 from public.doubt_queries d where d.id = doubt_id and d.student_id = auth.uid() and d.status <> 'closed')));
