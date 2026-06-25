-- ============================================================
-- Grant table permissions to authenticated and anon roles
-- RLS policies control row visibility, but Postgres still
-- requires explicit GRANT for the role to access the table.
-- ============================================================

grant usage on schema public to authenticated, anon;

grant select, insert, update, delete
  on public.organizations
  to authenticated;

grant select, insert, update, delete
  on public.organization_members
  to authenticated;

-- Allow authenticated users to execute the helper function
grant execute
  on function public.get_my_organization_ids()
  to authenticated;
