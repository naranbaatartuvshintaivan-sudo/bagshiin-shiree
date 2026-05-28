-- Багшийн Ширээ — planning boards (самбар)

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  title text not null default 'Сарын төлөвлөгөө',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table boards enable row level security;

drop policy if exists "own boards" on boards;
create policy "own boards" on boards for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop trigger if exists boards_updated_at on boards;
create trigger boards_updated_at before update on boards
  for each row execute function set_updated_at();

create index if not exists boards_teacher_id_idx on boards (teacher_id);
create index if not exists boards_class_id_idx on boards (class_id);
