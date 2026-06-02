-- Багшийн Ширээ — interactive activities (интерактив дасгал/тоглоом)

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  class_id   uuid references classes(id) on delete set null,
  lesson_id  uuid references lessons(id) on delete set null, -- хичээлд хавсрах
  template   text not null,          -- registry-д жагсаасан загвар
  title      text not null default 'Шинэ дасгал',
  content    jsonb not null default '{}'::jsonb, -- загвараас үл хамаарах агуулга
  settings   jsonb not null default '{}'::jsonb, -- таймер, оноо, дахин холих гэх мэт
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table activities enable row level security;

drop policy if exists "own activities" on activities;
create policy "own activities" on activities for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop trigger if exists activities_updated_at on activities;
create trigger activities_updated_at before update on activities
  for each row execute function set_updated_at();

create index if not exists activities_teacher_id_idx on activities (teacher_id);
create index if not exists activities_class_id_idx on activities (class_id);
create index if not exists activities_lesson_id_idx on activities (lesson_id);
create index if not exists activities_template_idx on activities (template);

-- Сонголтоор: тоглосон үр дүн хадгалах
create table if not exists activity_attempts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  player_name text,
  score integer,
  total integer,
  duration_ms integer,
  created_at timestamptz default now()
);

alter table activity_attempts enable row level security;

-- Зөвхөн дасгалын эзэн багш үр дүнг үзэж/нэмнэ.
drop policy if exists "own activity attempts" on activity_attempts;
create policy "own activity attempts" on activity_attempts for all
  using (
    exists (
      select 1 from activities a
      where a.id = activity_attempts.activity_id
        and a.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from activities a
      where a.id = activity_attempts.activity_id
        and a.teacher_id = auth.uid()
    )
  );

create index if not exists activity_attempts_activity_id_idx on activity_attempts (activity_id);
