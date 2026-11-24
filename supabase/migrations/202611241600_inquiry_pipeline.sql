-- Phase 1, step 4: inquiry pipeline schema.
-- Safe to re-run. Drops no data. Deploy the matching code at the same time:
-- inquiries.painting_id is renamed to product_id.

begin;

-- 1. inquiry_status: swap to the new set of values ---------------------------
do $$
begin
  if not exists (
    select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
    where t.typname = 'inquiry_status' and t.typnamespace = 'public'::regnamespace
      and e.enumlabel = 'closed_won'
  ) then
    alter type public.inquiry_status rename to inquiry_status_old;

    create type public.inquiry_status as enum (
      'new', 'contacted', 'reserved', 'quoted', 'payment_sent',
      'paid', 'in_progress', 'shipped', 'closed_won', 'closed_lost'
    );

    alter table public.inquiries alter column status drop default;
    alter table public.inquiries
      alter column status type public.inquiry_status
      using (case status::text when 'completed' then 'closed_won' else status::text end)::public.inquiry_status;
    alter table public.inquiries alter column status set default 'new';

    drop type public.inquiry_status_old;
  end if;
end $$;

-- 2. inquiry_type: create only if missing --------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'inquiry_type' and typnamespace = 'public'::regnamespace
  ) then
    create type public.inquiry_type as enum ('purchase', 'waitlist', 'commission', 'general');
  end if;

  -- An older failed run may have left a type with other labels. Stop with a clear message.
  if (
    select count(*) from pg_enum e join pg_type t on t.oid = e.enumtypid
    where t.typname = 'inquiry_type' and t.typnamespace = 'public'::regnamespace
      and e.enumlabel in ('purchase', 'waitlist', 'commission', 'general')
  ) <> 4 then
    raise exception 'public.inquiry_type exists but lacks the labels purchase, waitlist, commission, general';
  end if;
end $$;

-- 3. inquiries: product_id, new columns, constraint --------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'inquiries' and column_name = 'painting_id'
  ) then
    alter table public.inquiries rename column painting_id to product_id;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'inquiries_painting_id_fkey' and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries rename constraint inquiries_painting_id_fkey to inquiries_product_id_fkey;
  end if;
end $$;

alter table public.inquiries alter column product_id drop not null;

alter table public.inquiries add column if not exists type public.inquiry_type not null default 'purchase';
alter table public.inquiries add column if not exists source text not null default 'site';
alter table public.inquiries add column if not exists utm jsonb;
alter table public.inquiries add column if not exists referrer text;
alter table public.inquiries add column if not exists landing_path text;
alter table public.inquiries add column if not exists created_by text not null default 'public';
alter table public.inquiries add column if not exists closed_reason text;
alter table public.inquiries add column if not exists anonymized_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_product_required_check' and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries add constraint inquiries_product_required_check
      check (product_id is not null or type in ('commission', 'general'));
  end if;
end $$;

-- 4. inquiry_events ----------------------------------------------------------------------
create table if not exists public.inquiry_events (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid not null references public.inquiries(id) on delete cascade,
  kind        text not null check (kind in ('status', 'note', 'payment')),
  from_status public.inquiry_status,
  to_status   public.inquiry_status,
  note        text,
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);
create index if not exists inquiry_events_inquiry_id_created_at_idx
  on public.inquiry_events (inquiry_id, created_at);

alter table public.inquiry_events enable row level security;

drop policy if exists "Admins manage inquiry events" on public.inquiry_events;
create policy "Admins manage inquiry events" on public.inquiry_events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.inquiry_events from anon;
revoke truncate, trigger, references on public.inquiry_events from authenticated;

-- 5. Status change and its event in one transaction ----------------------------------------
create or replace function public.set_inquiry_status(
  p_inquiry_id uuid,
  p_status public.inquiry_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_from public.inquiry_status;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select status into v_from from public.inquiries where id = p_inquiry_id for update;
  if not found then
    raise exception 'inquiry not found';
  end if;
  if v_from = p_status then
    return;
  end if;

  update public.inquiries set status = p_status where id = p_inquiry_id;
  insert into public.inquiry_events (inquiry_id, kind, from_status, to_status, created_by)
  values (p_inquiry_id, 'status', v_from, p_status, auth.uid());
end;
$$;

revoke execute on function public.set_inquiry_status(uuid, public.inquiry_status) from public, anon;
grant execute on function public.set_inquiry_status(uuid, public.inquiry_status) to authenticated;

commit;
