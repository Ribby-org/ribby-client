-- Add new scan types: seo, ssl, dns, links
alter table public.scans drop constraint if exists scans_type_check;

alter table public.scans
  add constraint scans_type_check
  check (type in ('security','performance','accessibility','functional','load','seo','ssl','dns','links'));
