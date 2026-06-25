-- ============================================================
-- Migration: Create repo_scans table
-- Stores GitHub repository scan results per organization.
-- ============================================================

create table public.repo_scans (
  id              uuid        default gen_random_uuid() primary key,
  organization_id uuid        not null references public.organizations(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  repo_url        text        not null,
  owner           text        not null,
  repo            text        not null,
  default_branch  text        not null default 'main',
  score           integer     not null default 0,
  findings        jsonb       not null default '[]',
  summary         jsonb       not null default '{}',
  meta            jsonb       not null default '{}',
  error           text,
  completed_at    timestamptz,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,

  -- One record per org + repo_url (re-scans update it)
  unique (organization_id, repo_url)
);

create trigger repo_scans_updated_at
  before update on public.repo_scans
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.repo_scans enable row level security;

create policy "repo_scans_select"
  on public.repo_scans for select
  using (
    organization_id in (select public.get_my_organization_ids())
    or organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

create policy "repo_scans_insert"
  on public.repo_scans for insert
  with check (
    user_id = auth.uid()
    and (
      organization_id in (select public.get_my_organization_ids())
      or organization_id in (select id from public.organizations where owner_id = auth.uid())
    )
  );

create policy "repo_scans_update"
  on public.repo_scans for update
  using (user_id = auth.uid());

create policy "repo_scans_delete"
  on public.repo_scans for delete
  using (user_id = auth.uid());

grant select, insert, update, delete on public.repo_scans to authenticated;

create index idx_repo_scans_org  on public.repo_scans (organization_id);
create index idx_repo_scans_user on public.repo_scans (user_id);
