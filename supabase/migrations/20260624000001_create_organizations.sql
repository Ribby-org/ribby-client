-- ============================================================
-- Migration: Create organizations system
-- ============================================================

-- 1. Organizations table
create table public.organizations (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  description text,
  owner_id    uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- 2. Organization members table
create table public.organization_members (
  id              uuid  default gen_random_uuid() primary key,
  organization_id uuid  not null references public.organizations(id) on delete cascade,
  user_id         uuid  not null references auth.users(id) on delete cascade,
  role            text  not null default 'member'
                        check (role in ('owner', 'admin', 'member')),
  joined_at       timestamptz default now() not null,
  unique (organization_id, user_id)
);

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-update updated_at on organizations
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

-- Auto-add owner as member when org is created
create or replace function public.handle_new_organization()
returns trigger language plpgsql security definer as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_organization_created
  after insert on public.organizations
  for each row execute function public.handle_new_organization();

-- Enforce max 20 organizations per user
create or replace function public.check_organization_limit()
returns trigger language plpgsql security definer as $$
begin
  if (
    select count(*)
    from public.organizations
    where owner_id = new.owner_id
  ) >= 20 then
    raise exception 'You have reached the maximum of 20 organizations per account.';
  end if;
  return new;
end;
$$;

create trigger enforce_organization_limit
  before insert on public.organizations
  for each row execute function public.check_organization_limit();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.organizations       enable row level security;
alter table public.organization_members enable row level security;

-- Organizations: select
create policy "org_select"
  on public.organizations for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = id
        and m.user_id = auth.uid()
    )
  );

-- Organizations: insert
create policy "org_insert"
  on public.organizations for insert
  with check (owner_id = auth.uid());

-- Organizations: update
create policy "org_update"
  on public.organizations for update
  using (owner_id = auth.uid());

-- Organizations: delete
create policy "org_delete"
  on public.organizations for delete
  using (owner_id = auth.uid());

-- Members: select
create policy "members_select"
  on public.organization_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id
        and o.owner_id = auth.uid()
    )
  );

-- Members: insert / update / delete (owners only)
create policy "members_insert"
  on public.organization_members for insert
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id
        and o.owner_id = auth.uid()
    )
  );

create policy "members_delete"
  on public.organization_members for delete
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id
        and o.owner_id = auth.uid()
    )
  );

-- ============================================================
-- Indexes
-- ============================================================

create index idx_organizations_owner_id    on public.organizations (owner_id);
create index idx_members_organization_id   on public.organization_members (organization_id);
create index idx_members_user_id           on public.organization_members (user_id);
