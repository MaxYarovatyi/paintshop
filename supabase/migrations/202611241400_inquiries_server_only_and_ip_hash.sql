-- Phase 1, step 3: inquiries are written only by the server (secret key).
-- Safe to re-run.

begin;

-- 1. Drop ALL anon INSERT policies on inquiries (whatever their names are).
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'inquiries'
      and 'anon' = any (roles) and cmd in ('INSERT', 'ALL')
  loop
    execute format('drop policy %I on public.inquiries', p.policyname);
  end loop;
end $$;

-- Anon has no access to inquiries at all.
revoke all on public.inquiries from anon;

-- 2. Hashed IP for rate limiting. The raw IP is never stored.
alter table public.inquiries add column if not exists ip_hash text;
create index if not exists inquiries_ip_hash_created_at_idx
  on public.inquiries (ip_hash, created_at);

commit;
