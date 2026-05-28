-- Багшийн Ширээ — initial schema

create extension if not exists "pgcrypto";

create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid references grades(id) on delete cascade,
  title text not null,
  description text,
  content text,
  lesson_date date,
  created_at timestamptz default now()
);

create table if not exists lesson_files (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  created_at timestamptz default now()
);

create index if not exists lessons_grade_id_idx on lessons (grade_id);
create index if not exists lessons_lesson_date_idx on lessons (lesson_date desc);
create index if not exists lesson_files_lesson_id_idx on lesson_files (lesson_id);

insert into grades (label, order_index) values
  ('6-р анги', 1),
  ('7-р анги', 2),
  ('8-р анги', 3),
  ('9-р анги', 4),
  ('10-р анги', 5),
  ('11-р анги', 6),
  ('12-р анги', 7)
on conflict do nothing;

-- Storage bucket for lesson files (public read).
insert into storage.buckets (id, name, public)
values ('lesson-files', 'lesson-files', true)
on conflict (id) do nothing;

-- Permissive policies for single-teacher use (no auth).
alter table grades enable row level security;
alter table lessons enable row level security;
alter table lesson_files enable row level security;

drop policy if exists "grades read all" on grades;
drop policy if exists "grades write all" on grades;
create policy "grades read all"  on grades for select using (true);
create policy "grades write all" on grades for all    using (true) with check (true);

drop policy if exists "lessons read all" on lessons;
drop policy if exists "lessons write all" on lessons;
create policy "lessons read all"  on lessons for select using (true);
create policy "lessons write all" on lessons for all    using (true) with check (true);

drop policy if exists "lesson_files read all" on lesson_files;
drop policy if exists "lesson_files write all" on lesson_files;
create policy "lesson_files read all"  on lesson_files for select using (true);
create policy "lesson_files write all" on lesson_files for all    using (true) with check (true);

drop policy if exists "lesson-files public read" on storage.objects;
drop policy if exists "lesson-files write all"   on storage.objects;
create policy "lesson-files public read" on storage.objects
  for select using (bucket_id = 'lesson-files');
create policy "lesson-files write all" on storage.objects
  for all using (bucket_id = 'lesson-files') with check (bucket_id = 'lesson-files');
