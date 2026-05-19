-- Harden public Supabase tables flagged by Security Advisor.
-- Backend routes use the service-role key; browser clients should not get
-- direct table access to these operational/customer records.

alter table if exists public.unsubscribes enable row level security;
alter table if exists public.change_requests enable row level security;
alter table if exists public.website_previews enable row level security;
alter table if exists public.feedback enable row level security;
alter table if exists public.drip_queue enable row level security;

drop policy if exists "Service role full access" on public.audit_requests;
drop policy if exists "Service role full access" on public.audits;
drop policy if exists "Service role full access" on public.outbound_emails;
drop policy if exists "Service role full access" on public.clients;
drop policy if exists "Service role full access" on public.unsubscribes;
drop policy if exists "Service role full access" on public.change_requests;
drop policy if exists "Service role full access" on public.website_previews;
drop policy if exists "Service role full access" on public.feedback;
drop policy if exists "Service role full access" on public.drip_queue;

create policy "Service role full access" on public.audit_requests
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.audits
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.outbound_emails
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.clients
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.unsubscribes
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.change_requests
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.website_previews
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.feedback
  for all to service_role using (true) with check (true);

create policy "Service role full access" on public.drip_queue
  for all to service_role using (true) with check (true);
