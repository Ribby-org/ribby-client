-- ============================================================
-- Analytics: sites + events
-- Each org creates a "site" with a unique key.
-- External apps send events to a public ingest endpoint
-- using that key — no auth required on ingest.
-- ============================================================

-- Site registry
create table public.analytics_sites (
  id              uuid        default gen_random_uuid() primary key,
  organization_id uuid        not null references public.organizations(id) on delete cascade,
  name            text        not null,
  domain          text,
  site_key        text        unique not null,
  created_at      timestamptz default now() not null
);

-- Raw events (pageviews, web vitals)
create table public.analytics_events (
  id          uuid        default gen_random_uuid() primary key,
  site_key    text        not null,
  type        text        not null check (type in ('pageview','vitals','custom')),
  page_url    text,
  referrer    text,
  country     text,
  device      text        check (device in ('desktop','mobile','tablet')),
  browser     text,
  session_id  text,
  -- Web Vitals (ms or score)
  lcp         numeric,
  fid         numeric,
  cls         numeric,
  ttfb        numeric,
  fcp         numeric,
  -- Custom event
  event_name  text,
  created_at  timestamptz default now() not null
);

-- RLS for sites
alter table public.analytics_sites  enable row level security;
alter table public.analytics_events enable row level security;

-- Sites: org members can read/write their own sites
create policy "sites_select" on public.analytics_sites for select
  using (
    organization_id in (select public.get_my_organization_ids())
    or organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

create policy "sites_insert" on public.analytics_sites for insert
  with check (
    organization_id in (select public.get_my_organization_ids())
    or organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

create policy "sites_delete" on public.analytics_sites for delete
  using (
    organization_id in (select public.get_my_organization_ids())
    or organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

-- Events: org members can read events for their sites
create policy "events_select" on public.analytics_events for select
  using (
    site_key in (
      select s.site_key from public.analytics_sites s
      where s.organization_id in (select public.get_my_organization_ids())
         or s.organization_id in (select id from public.organizations where owner_id = auth.uid())
    )
  );

-- Events insert is open to service_role only (called from server ingest)
-- The ingest endpoint validates the site_key before inserting.
create policy "events_insert" on public.analytics_events for insert
  with check (true);

grant select, insert, delete on public.analytics_sites  to authenticated;
grant select, insert        on public.analytics_events to authenticated, anon;

create index idx_analytics_site_key      on public.analytics_events (site_key);
create index idx_analytics_created_at    on public.analytics_events (site_key, created_at desc);
create index idx_analytics_sites_org     on public.analytics_sites (organization_id);
