-- ============================================================
-- Migration: Create scans table
-- Stores full scan results per organization, URL, and test type.
-- Upserts on (organization_id, url, type) so re-running a test
-- updates the existing record instead of creating duplicates.
-- ============================================================

create table public.scans (
  id              uuid        default gen_random_uuid() primary key,
  organization_id uuid        not null references public.organizations(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  url             text        not null,
  type            text        not null
                              check (type in ('security','performance','accessibility','functional','load')),
  score           integer     not null default 0,
  findings        jsonb       not null default '[]',
  summary         jsonb       not null default '{}',
  meta            jsonb       not null default '{}',
  load_stats      jsonb,
  error           text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,

  -- One record per org + url + type (re-runs update it)
  unique (organization_id, url, type)
);

-- Auto-update updated_at
create trigger scans_updated_at
  before update on public.scans
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.scans enable row level security;

create policy "scans_select"
  on public.scans for select
  using (
    organization_id in (select public.get_my_organization_ids())
    or organization_id in (
      select id from public.organizations where owner_id = auth.uid()
    )
  );

create policy "scans_insert"
  on public.scans for insert
  with check (
    user_id = auth.uid()
    and (
      organization_id in (select public.get_my_organization_ids())
      or organization_id in (
        select id from public.organizations where owner_id = auth.uid()
      )
    )
  );

create policy "scans_update"
  on public.scans for update
  using (user_id = auth.uid());

create policy "scans_delete"
  on public.scans for delete
  using (user_id = auth.uid());

-- Grants
grant select, insert, update, delete
  on public.scans
  to authenticated;

-- Indexes
create index idx_scans_organization_id on public.scans (organization_id);
create index idx_scans_user_id         on public.scans (user_id);
create index idx_scans_url             on public.scans (organization_id, url);
