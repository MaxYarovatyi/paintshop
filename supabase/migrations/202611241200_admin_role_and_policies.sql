-- Phase 1, step 1: admin role, admin-only write policies, tighter grants.
-- Safe to re-run. Drops only policies that are replaced, never data.
--
-- After running, also run (once):
--   insert into public.admins (user_id) select id from auth.users on conflict do nothing;
-- and disable public sign-ups in Auth settings.

begin;

-- 1. Admins table and helper (both already exist; kept idempotent) -----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- A signed-in user may check their own admin row (used by the app).
drop policy if exists "Users can read own admin row" on public.admins;
create policy "Users can read own admin row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- 2. Replace "authenticated ... true" policies with is_admin() ---------------
alter table public.inquiries enable row level security;

drop policy if exists "Authenticated can manage paintings" on public.products;
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated can manage painting images" on public.product_images;
drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated can manage series" on public.series;
drop policy if exists "Admins manage series" on public.series;
create policy "Admins manage series" on public.series
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated can manage inquiries" on public.inquiries;
drop policy if exists "Admins manage inquiries" on public.inquiries;
create policy "Admins manage inquiries" on public.inquiries
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 3. Storage: only admins write to bucket "paintings"; public read stays -----
-- (The bucket is public, so object URLs need no SELECT policy.)
drop policy if exists "Authenticated can upload painting images" on storage.objects;
drop policy if exists "Authenticated can update painting images" on storage.objects;
drop policy if exists "Authenticated can delete painting images" on storage.objects;
drop policy if exists "Authenticated can view painting files" on storage.objects;
drop policy if exists "Admins upload painting images" on storage.objects;
drop policy if exists "Admins update painting images" on storage.objects;
drop policy if exists "Admins delete painting images" on storage.objects;
drop policy if exists "Admins view painting files" on storage.objects;

create policy "Admins upload painting images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'paintings' and public.is_admin());
create policy "Admins update painting images" on storage.objects
  for update to authenticated
  using (bucket_id = 'paintings' and public.is_admin())
  with check (bucket_id = 'paintings' and public.is_admin());
create policy "Admins delete painting images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'paintings' and public.is_admin());
create policy "Admins view painting files" on storage.objects
  for select to authenticated
  using (bucket_id = 'paintings' and public.is_admin());

-- 4. Grants: defense in depth (RLS stays the main control) --------------------
-- TRUNCATE ignores RLS, so nobody but the owner and service_role may hold it.
revoke truncate, trigger, references on
  public.admins, public.inquiries, public.product_images, public.products, public.series
  from anon, authenticated;

-- Anonymous visitors only read. Exception: inquiries INSERT stays until
-- step 3 moves inquiry writes to a server-only client.
revoke insert, update, delete on
  public.admins, public.product_images, public.products, public.series
  from anon, authenticated;
grant insert, update, delete on
  public.product_images, public.products, public.series
  to authenticated;

revoke update, delete on public.inquiries from anon;
revoke select on public.inquiries from anon;

revoke all on public.admins from anon;
revoke insert, update, delete on public.admins from authenticated;

-- The view is read-only for everyone through the API.
revoke insert, update, delete, truncate, trigger, references
  on public.products_public from anon, authenticated;

commit;
