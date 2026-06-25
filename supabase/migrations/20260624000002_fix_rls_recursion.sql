-- ============================================================
-- Fix: infinite recursion in organizations RLS policies
-- The circular reference: organizations policy checks
-- organization_members, which checks organizations → loop.
-- Solution: use a security definer function that bypasses RLS
-- when looking up memberships.
-- ============================================================

-- Drop the recursive policies
drop policy if exists "org_select"     on public.organizations;
drop policy if exists "members_select" on public.organization_members;
drop policy if exists "members_insert" on public.organization_members;
drop policy if exists "members_delete" on public.organization_members;

-- Helper function: returns org IDs the user belongs to
-- security definer = runs as the function owner, bypasses RLS
create or replace function public.get_my_organization_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid();
$$;

-- Organizations: users can see orgs they own OR are a member of
-- Uses the helper to avoid touching organizations from within organization_members policy
create policy "org_select"
  on public.organizations for select
  using (
    owner_id = auth.uid()
    or id in (select public.get_my_organization_ids())
  );

-- Members: users can only see their own membership rows
-- No cross-reference to organizations needed here
create policy "members_select"
  on public.organization_members for select
  using (user_id = auth.uid());

-- Members: only the org owner can add members
-- Uses the helper instead of querying organizations directly
create policy "members_insert"
  on public.organization_members for insert
  with check (
    organization_id in (
      select id from public.organizations
      where owner_id = auth.uid()
    )
  );

-- Members: only the org owner can remove members
create policy "members_delete"
  on public.organization_members for delete
  using (
    organization_id in (
      select id from public.organizations
      where owner_id = auth.uid()
    )
  );
