-- ============================================================================
-- Beacon — Supabase setup for admin-managed questions
-- ----------------------------------------------------------------------------
-- Run this ONCE in your Supabase project:
--   Dashboard  ->  SQL Editor  ->  New query  ->  paste all of this  ->  Run.
--
-- What it creates:
--   * a "questions" table that every visitor can READ (so all students see the
--     same question bank);
--   * two secured functions the admin panel calls to ADD / DELETE questions,
--     gated by the admin password on the server side;
--   * a public "question-images" storage bucket for photo/diagram questions.
--
-- Safe to re-run: every statement is written to be idempotent.
-- ============================================================================

-- 1) The shared question bank ------------------------------------------------
create table if not exists public.questions (
  id          text primary key,
  exam        text,
  skill       text,
  type        text,
  data        jsonb not null,          -- the whole question object (prompt, choices, answer, image, …)
  created_at  timestamptz default now()
);

alter table public.questions enable row level security;

-- Anyone (logged in or not) may read questions.
drop policy if exists "questions public read" on public.questions;
create policy "questions public read"
  on public.questions for select
  using (true);
-- NOTE: no INSERT/UPDATE/DELETE policy exists, so the table cannot be written
-- directly from the browser. Writes only happen through the functions below.

-- 2) Admin write functions (password checked on the server) ------------------
-- The admin password lives ONLY inside these functions, never in the website
-- code. If you change the admin password, change the two lines marked below.

create or replace function public.beacon_add_question(pass text, q jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if pass is distinct from 'Milanaadmin' then      -- <-- admin password
    raise exception 'not authorized';
  end if;
  insert into public.questions (id, exam, skill, type, data)
  values (q->>'id', q->>'exam', q->>'skill', q->>'type', q)
  on conflict (id) do update
    set exam = excluded.exam,
        skill = excluded.skill,
        type = excluded.type,
        data = excluded.data;
end;
$$;

create or replace function public.beacon_delete_question(pass text, qid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if pass is distinct from 'Milanaadmin' then      -- <-- admin password
    raise exception 'not authorized';
  end if;
  delete from public.questions where id = qid;
end;
$$;

grant execute on function public.beacon_add_question(text, jsonb) to anon, authenticated;
grant execute on function public.beacon_delete_question(text, text) to anon, authenticated;

-- 3) Image storage for photo questions --------------------------------------
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

drop policy if exists "question-images public read" on storage.objects;
create policy "question-images public read"
  on storage.objects for select
  using (bucket_id = 'question-images');

drop policy if exists "question-images upload" on storage.objects;
create policy "question-images upload"
  on storage.objects for insert
  with check (bucket_id = 'question-images');

-- 4) Per-student progress (Saved list + solved), synced across devices ------
-- Each signed-in student gets one row, keyed to their account. Row-level
-- security guarantees a student can only ever read/write their OWN progress.
create table if not exists public.progress (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  favorites   jsonb default '[]'::jsonb,   -- ids of saved questions
  solved      jsonb default '{}'::jsonb,   -- { "exam/skill/type": [ids…] }
  prefs       jsonb default '{}'::jsonb,   -- { goals:{exam:{target}}, scores:{exam:[…]} }
  updated_at  timestamptz default now()
);
-- add prefs to an existing progress table (safe if it already exists)
alter table public.progress add column if not exists prefs jsonb default '{}'::jsonb;

alter table public.progress enable row level security;

drop policy if exists "progress owner read" on public.progress;
create policy "progress owner read"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress owner insert" on public.progress;
create policy "progress owner insert"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress owner update" on public.progress;
create policy "progress owner update"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Done. Reload the site; questions you add in the admin panel are now shared,
-- and each student's Saved list + progress follow them to any device.
