create extension if not exists pgcrypto;

create type public.google_connection_status as enum (
  'pending',
  'active',
  'expired',
  'revoked',
  'error'
);

create type public.conversion_job_status as enum (
  'uploaded',
  'analyzing',
  'ready_for_export',
  'authorizing_google',
  'queued',
  'converting',
  'partial_success',
  'success',
  'failed'
);

create type public.compatibility_level as enum (
  'preserved',
  'partial',
  'unsupported',
  'failed'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  google_subject_id text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.google_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'google',
  status public.google_connection_status not null default 'pending',
  scopes text[] not null default '{}'::text[],
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  last_validated_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, provider)
);

create table if not exists public.conversion_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  google_connection_id uuid references public.google_connections(id) on delete set null,
  source_file_path text not null,
  source_file_name text not null,
  source_file_type text not null,
  source_file_size_bytes bigint not null check (source_file_size_bytes > 0),
  checksum_sha256 text,
  status public.conversion_job_status not null default 'uploaded',
  workbook_name text,
  sheet_count integer not null default 0,
  total_cell_count integer not null default 0,
  preview_json jsonb not null default '{}'::jsonb,
  report_json jsonb not null default '{}'::jsonb,
  compatibility_score numeric(5,2) not null default 0,
  google_file_id text,
  google_sheet_url text,
  latest_error_code text,
  latest_error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversion_job_sheets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.conversion_jobs(id) on delete cascade,
  sheet_index integer not null,
  sheet_name text not null,
  row_count integer not null default 0,
  column_count integer not null default 0,
  compatibility_score numeric(5,2) not null default 0,
  analysis_json jsonb not null default '{}'::jsonb,
  report_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (job_id, sheet_index)
);

create table if not exists public.conversion_job_events (
  id bigint generated always as identity primary key,
  job_id uuid not null references public.conversion_jobs(id) on delete cascade,
  event_type text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversion_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.conversion_jobs(id) on delete cascade,
  artifact_type text not null,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_google_connections_user_status
  on public.google_connections (user_id, status);

create index if not exists idx_conversion_jobs_user_created_at
  on public.conversion_jobs (user_id, created_at desc);

create index if not exists idx_conversion_jobs_status_created_at
  on public.conversion_jobs (status, created_at desc);

create index if not exists idx_conversion_job_sheets_job_id
  on public.conversion_job_sheets (job_id);

create index if not exists idx_conversion_job_events_job_id_created_at
  on public.conversion_job_events (job_id, created_at desc);

create index if not exists idx_conversion_artifacts_job_id
  on public.conversion_artifacts (job_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_google_connections_updated_at on public.google_connections;
create trigger set_google_connections_updated_at
before update on public.google_connections
for each row
execute function public.set_updated_at();

drop trigger if exists set_conversion_jobs_updated_at on public.conversion_jobs;
create trigger set_conversion_jobs_updated_at
before update on public.conversion_jobs
for each row
execute function public.set_updated_at();

drop trigger if exists set_conversion_job_sheets_updated_at on public.conversion_job_sheets;
create trigger set_conversion_job_sheets_updated_at
before update on public.conversion_job_sheets
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.google_connections enable row level security;
alter table public.conversion_jobs enable row level security;
alter table public.conversion_job_sheets enable row level security;
alter table public.conversion_job_events enable row level security;
alter table public.conversion_artifacts enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "google_connections_select_own"
on public.google_connections
for select
to authenticated
using (auth.uid() = user_id);

create policy "google_connections_insert_own"
on public.google_connections
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "google_connections_update_own"
on public.google_connections
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "conversion_jobs_select_own"
on public.conversion_jobs
for select
to authenticated
using (auth.uid() = user_id);

create policy "conversion_jobs_insert_own"
on public.conversion_jobs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "conversion_jobs_update_own"
on public.conversion_jobs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "conversion_job_sheets_select_own"
on public.conversion_job_sheets
for select
to authenticated
using (
  exists (
    select 1
    from public.conversion_jobs jobs
    where jobs.id = conversion_job_sheets.job_id
      and jobs.user_id = auth.uid()
  )
);

create policy "conversion_job_events_select_own"
on public.conversion_job_events
for select
to authenticated
using (
  exists (
    select 1
    from public.conversion_jobs jobs
    where jobs.id = conversion_job_events.job_id
      and jobs.user_id = auth.uid()
  )
);

create policy "conversion_artifacts_select_own"
on public.conversion_artifacts
for select
to authenticated
using (
  exists (
    select 1
    from public.conversion_jobs jobs
    where jobs.id = conversion_artifacts.job_id
      and jobs.user_id = auth.uid()
  )
);
