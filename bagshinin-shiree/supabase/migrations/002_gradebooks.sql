-- Багшийн Ширээ — gradebooks (дүнгийн дэвтэр)

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists gradebooks (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'Дүнгийн дэвтэр',
  columns jsonb not null default '[]'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table gradebooks enable row level security;

drop policy if exists "own gradebooks" on gradebooks;
create policy "own gradebooks" on gradebooks for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop trigger if exists gradebooks_updated_at on gradebooks;
create trigger gradebooks_updated_at before update on gradebooks
  for each row execute function set_updated_at();

create index if not exists gradebooks_class_id_idx on gradebooks (class_id);
create index if not exists gradebooks_teacher_id_idx on gradebooks (teacher_id);
