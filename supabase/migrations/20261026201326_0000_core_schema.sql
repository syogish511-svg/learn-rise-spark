/*
# Core school portal schema

Creates the foundational tables for the SRSV Class 10 ICSE school portal:
- User profiles, roles, parent-student links
- Subjects and chapters
- Assignments and submissions
- Resources and resource access control
- Tests and test marks
- Announcements, app settings, activity log, audit log

## Security
- RLS enabled on every table
- SECURITY DEFINER helper functions: has_role, is_staff, is_parent_of
- Auth trigger auto-creates profile + assigns first user as admin
- Policies scope reads to owner/staff/parent; writes to staff only
- Announcements and app_settings readable by anon (public)
*/

create type public.app_role as enum ('admin','teacher','student','parent');
create type public.submission_status as enum ('submitted','under_review','corrections_required','reviewed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  student_code text unique,
  phone text,
  parent_name text,
  parent_phone text,
  class_level text not null default '10',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','teacher'))
$$;

create table public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  unique(parent_id, student_id)
);
grant select, insert, delete on public.parent_links to authenticated;
grant all on public.parent_links to service_role;
alter table public.parent_links enable row level security;

create or replace function public.is_parent_of(_parent uuid, _student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.parent_links where parent_id = _parent and student_id = _student)
$$;

create policy "own roles or staff" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()) or public.is_parent_of(auth.uid(), id));
create policy "profiles staff update" on public.profiles for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "parent links read" on public.parent_links for select to authenticated
  using (parent_id = auth.uid() or public.is_staff(auth.uid()));
create policy "parent links staff write" on public.parent_links for insert to authenticated
  with check (public.is_staff(auth.uid()));
create policy "parent links staff delete" on public.parent_links for delete to authenticated
  using (public.is_staff(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, student_code)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'student_code',''));
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.subjects, public.chapters to authenticated;
grant all on public.subjects, public.chapters to service_role;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
create policy "subjects read" on public.subjects for select to authenticated using (true);
create policy "subjects staff write" on public.subjects for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "chapters read" on public.chapters for select to authenticated using (true);
create policy "chapters staff write" on public.chapters for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  assignment_type text not null default 'homework',
  due_at timestamptz not null,
  max_marks numeric not null default 10,
  published boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.assignments to authenticated;
grant all on public.assignments to service_role;
alter table public.assignments enable row level security;
create policy "assignments read" on public.assignments for select to authenticated
  using (public.is_staff(auth.uid()) or published);
create policy "assignments staff write" on public.assignments for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  file_path text not null,
  file_name text not null default '',
  note text not null default '',
  submitted_at timestamptz not null default now(),
  status submission_status not null default 'submitted',
  marks numeric,
  feedback text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  unique(assignment_id, student_id)
);
grant select, insert, update on public.submissions to authenticated;
grant all on public.submissions to service_role;
alter table public.submissions enable row level security;
create policy "submissions read" on public.submissions for select to authenticated
  using (student_id = auth.uid() or public.is_staff(auth.uid()) or public.is_parent_of(auth.uid(), student_id));
create policy "submissions student insert" on public.submissions for insert to authenticated
  with check (student_id = auth.uid() and status = 'submitted' and marks is null and feedback is null);
create policy "submissions staff update" on public.submissions for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create or replace function public.resubmit_work(_submission uuid, _file_path text, _file_name text, _note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.submissions set file_path = _file_path, file_name = _file_name, note = _note,
    submitted_at = now(), status = 'submitted'
  where id = _submission and student_id = auth.uid() and status = 'corrections_required';
  if not found then raise exception 'Resubmission not allowed'; end if;
end; $$;

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  resource_type text not null default 'notes',
  class_level text not null default '10',
  file_path text,
  file_name text,
  external_url text,
  visibility text not null default 'all',
  published boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table public.resource_access (
  resource_id uuid not null references public.resources(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key (resource_id, student_id)
);
grant select, insert, update, delete on public.resources, public.resource_access to authenticated;
grant all on public.resources, public.resource_access to service_role;
alter table public.resources enable row level security;
alter table public.resource_access enable row level security;
create or replace function public.can_view_resource(_uid uuid, _resource uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff(_uid) or exists (
    select 1 from public.resources r where r.id = _resource and r.published and (
      r.visibility = 'all' or exists (select 1 from public.resource_access a where a.resource_id = r.id and a.student_id = _uid)))
$$;
create policy "resources read" on public.resources for select to authenticated using (public.can_view_resource(auth.uid(), id));
create policy "resources staff write" on public.resources for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "resource access read" on public.resource_access for select to authenticated using (student_id = auth.uid() or public.is_staff(auth.uid()));
create policy "resource access staff write" on public.resource_access for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  test_date date not null default current_date,
  max_marks numeric not null default 100,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table public.test_marks (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  marks numeric not null,
  remarks text not null default '',
  updated_at timestamptz not null default now(),
  unique(test_id, student_id)
);
grant select, insert, update, delete on public.tests, public.test_marks to authenticated;
grant all on public.tests, public.test_marks to service_role;
alter table public.tests enable row level security;
alter table public.test_marks enable row level security;
create policy "tests read" on public.tests for select to authenticated using (true);
create policy "tests staff write" on public.tests for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "marks read" on public.test_marks for select to authenticated
  using (student_id = auth.uid() or public.is_staff(auth.uid()) or public.is_parent_of(auth.uid(), student_id));
create policy "marks staff write" on public.test_marks for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  published boolean not null default false,
  pinned boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.announcements to anon;
grant select, insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "announcements public read" on public.announcements for select to anon, authenticated using (published or public.is_staff(auth.uid()));
create policy "announcements staff write" on public.announcements for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.app_settings to anon;
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "settings read" on public.app_settings for select to anon, authenticated using (is_public or public.is_staff(auth.uid()));
create policy "settings staff write" on public.app_settings for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_log to authenticated;
grant all on public.activity_log to service_role;
alter table public.activity_log enable row level security;
create policy "activity read" on public.activity_log for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()) or public.is_parent_of(auth.uid(), user_id));
create policy "activity insert self" on public.activity_log for insert to authenticated with check (user_id = auth.uid());

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "audit staff read" on public.audit_log for select to authenticated using (public.is_staff(auth.uid()));
create policy "audit staff insert" on public.audit_log for insert to authenticated with check (actor_id = auth.uid() and public.is_staff(auth.uid()));

insert into public.subjects (name) values ('Mathematics');
insert into public.chapters (subject_id, name, sort_order)
select s.id, c.name, c.ord from public.subjects s,
 (values ('GST',1),('Banking',2),('Shares and Dividends',3),('Linear Inequations',4),('Quadratic Equations',5),
  ('Ratio and Proportion',6),('Factorisation',7),('Matrices',8),('Arithmetic Progression',9),('Geometric Progression',10),
  ('Coordinate Geometry',11),('Similarity',12),('Loci',13),('Circles',14),('Constructions',15),
  ('Mensuration',16),('Trigonometry',17),('Heights and Distances',18),('Statistics',19),('Probability',20)) as c(name, ord)
where s.name = 'Mathematics';
