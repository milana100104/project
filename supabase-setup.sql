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

-- 2) Admin write functions (authorization checked on the server) -------------
-- Who counts as an admin: either the shared admin password is supplied, OR the
-- caller is signed in with an admin email (e.g. via Google). Add emails to the
-- array below to grant a real account admin powers.
create or replace function public.beacon_is_admin(pass text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select pass = 'Milanaadmin'                                   -- <-- shared admin password
      or coalesce(auth.jwt() ->> 'email', '') = any (array[
           'loki100104@gmail.com'                               -- <-- admin email(s)
         ]);
$$;
grant execute on function public.beacon_is_admin(text) to anon, authenticated;

create or replace function public.beacon_add_question(pass text, q jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.beacon_is_admin(pass) then
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
  if not public.beacon_is_admin(pass) then
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

-- 5) Community chat: unique nicknames, a public room, and direct messages ---
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nickname   text unique not null,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles read all" on public.profiles;
create policy "profiles read all" on public.profiles for select using (true);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = user_id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete set null,
  nickname   text not null,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz default now()
);
alter table public.messages enable row level security;
drop policy if exists "messages read all" on public.messages;
create policy "messages read all" on public.messages for select using (true);
drop policy if exists "messages insert own" on public.messages;
create policy "messages insert own" on public.messages for insert with check (auth.uid() = user_id);

create table if not exists public.dms (
  id         bigint generated always as identity primary key,
  from_user  uuid references auth.users(id) on delete set null,
  to_user    uuid references auth.users(id) on delete cascade,
  from_nick  text not null,
  to_nick    text not null,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz default now()
);
alter table public.dms enable row level security;
drop policy if exists "dms read own" on public.dms;
create policy "dms read own" on public.dms for select using (auth.uid() = from_user or auth.uid() = to_user);
drop policy if exists "dms insert own" on public.dms;
create policy "dms insert own" on public.dms for insert with check (auth.uid() = from_user);

-- avatars (an animal-picture id like 'fox', chosen in the profile) — safe to add if missing
alter table public.profiles add column if not exists avatar text;
alter table public.messages add column if not exists avatar text;
alter table public.dms      add column if not exists avatar text;

-- make sure the API roles can reach the chat tables (RLS still governs rows)
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.messages to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert on public.messages to authenticated;
grant select, insert on public.dms to authenticated;

-- turn on realtime for the chat tables (idempotent)
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages')
    then alter publication supabase_realtime add table public.messages; end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dms')
    then alter publication supabase_realtime add table public.dms; end if;
end $$;

-- ============================================================================
-- 8) Shared webinars (admin-managed, visible to every student) ---------------
-- Same pattern as questions: everyone can READ; only the admin functions WRITE.
create table if not exists public.webinars (
  id          text primary key,
  iso         text,                       -- e.g. '2026-08-09T18:00' — used to sort by date
  data        jsonb not null,             -- the whole webinar (title, desc, date, url, cover, …)
  created_at  timestamptz default now()
);

alter table public.webinars enable row level security;

drop policy if exists "webinars public read" on public.webinars;
create policy "webinars public read" on public.webinars for select using (true);

create or replace function public.beacon_add_webinar(pass text, w jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.beacon_is_admin(pass) then
    raise exception 'not authorized';
  end if;
  insert into public.webinars (id, iso, data)
  values (w->>'id', w->>'iso', w)
  on conflict (id) do update set iso = excluded.iso, data = excluded.data;
end; $$;

create or replace function public.beacon_delete_webinar(pass text, wid text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.beacon_is_admin(pass) then
    raise exception 'not authorized';
  end if;
  delete from public.webinars where id = wid;
end; $$;

grant execute on function public.beacon_add_webinar(text, jsonb) to anon, authenticated;
grant execute on function public.beacon_delete_webinar(text, text) to anon, authenticated;

-- Seed the shared list with the current default webinars (safe to re-run).
insert into public.webinars (id, iso, data) values
  ('w1','2026-08-02T18:00', '{"id":"w1","iso":"2026-08-02T18:00","date":"Aug 02 · 6:00 PM","title":"The new TOEFL Speaking, decoded","desc":"What Listen-and-Repeat and the interview task actually reward — and how to rehearse for them.","url":"#","cover":""}'::jsonb),
  ('w2','2026-08-09T18:00', '{"id":"w2","iso":"2026-08-09T18:00","date":"Aug 09 · 6:00 PM","title":"An IELTS Task 2 that actually scores","desc":"A structure examiners recognize, and the mistakes that quietly cost you a band.","url":"#","cover":""}'::jsonb),
  ('w3','2026-08-16T18:00', '{"id":"w3","iso":"2026-08-16T18:00","date":"Aug 16 · 6:00 PM","title":"Digital SAT Math: pacing the two modules","desc":"How the adaptive second module works, and where students lose easy points.","url":"#","cover":""}'::jsonb),
  ('w4','2026-08-23T18:00', '{"id":"w4","iso":"2026-08-23T18:00","date":"Aug 23 · 6:00 PM","title":"TOEFL Reading: beating the clock","desc":"A repeatable way to read academic passages fast without losing the details the questions test.","url":"#","cover":""}'::jsonb),
  ('w5','2026-08-30T18:00', '{"id":"w5","iso":"2026-08-30T18:00","date":"Aug 30 · 6:00 PM","title":"IELTS Listening: the traps in Section 3","desc":"Multi-speaker discussions, distractors, and how to keep your place on the answer sheet.","url":"#","cover":""}'::jsonb),
  ('w6','2026-09-06T18:00', '{"id":"w6","iso":"2026-09-06T18:00","date":"Sep 06 · 6:00 PM","title":"SAT Reading & Writing: grammar that pays off","desc":"The handful of Standard English Conventions questions you can get right every single time.","url":"#","cover":""}'::jsonb)
on conflict (id) do nothing;

-- ============================================================================
-- 9) "Book a session with a mentor" - anyone can submit, only the admin can read
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_requests (
  id          bigint generated always as identity primary key,
  name        text not null,
  telegram    text not null,
  exam        text not null,
  created_at  timestamptz default now()
);
-- whether the admin has already reached out about this request
alter table public.mentor_requests add column if not exists contacted boolean not null default false;
alter table public.mentor_requests enable row level security;

-- Any visitor (no login needed) may submit a request; nobody can read the table
-- directly - that only happens through the admin-gated function below.
drop policy if exists "mentor requests insert" on public.mentor_requests;
create policy "mentor requests insert"
  on public.mentor_requests for insert
  with check (true);
grant insert on public.mentor_requests to anon, authenticated;

create or replace function public.beacon_list_mentor_requests(pass text)
returns setof public.mentor_requests
language plpgsql security definer set search_path = public as $$
begin
  if not public.beacon_is_admin(pass) then
    raise exception 'not authorized';
  end if;
  return query select * from public.mentor_requests order by created_at desc;
end; $$;

create or replace function public.beacon_delete_mentor_request(pass text, rid bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.beacon_is_admin(pass) then
    raise exception 'not authorized';
  end if;
  delete from public.mentor_requests where id = rid;
end; $$;

create or replace function public.beacon_set_mentor_contacted(pass text, rid bigint, done boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.beacon_is_admin(pass) then
    raise exception 'not authorized';
  end if;
  update public.mentor_requests set contacted = done where id = rid;
end; $$;

grant execute on function public.beacon_list_mentor_requests(text) to anon, authenticated;
grant execute on function public.beacon_delete_mentor_request(text, bigint) to anon, authenticated;
grant execute on function public.beacon_set_mentor_contacted(text, bigint, boolean) to anon, authenticated;

-- ============================================================================
-- 10) Housekeeping: auto-purge old public chat messages -----------------------
-- ----------------------------------------------------------------------------
-- Keeps the "messages" (public group chat) table from growing without bound as
-- more students use the chat. Runs daily at 03:00 UTC, deletes anything older
-- than 7 days. Private DMs are left alone on purpose - only the public feed
-- is pruned.
--
-- NOTE: this needs the "pg_cron" extension enabled once for your project first:
--   Dashboard -> Database -> Extensions -> search "pg_cron" -> Enable.
-- Only after that will the statement below run without erroring.
select cron.unschedule('purge-old-messages')
where exists (select 1 from cron.job where jobname = 'purge-old-messages');

select cron.schedule(
  'purge-old-messages',
  '0 3 * * *',
  $$delete from public.messages where created_at < now() - interval '7 days'$$
);

-- Done. Reload the site; questions AND webinars you manage in the admin panel are
-- now shared with everyone, each student's Saved list + progress follow them to any
-- device, and the bottom-right chat is live for signed-in students.
