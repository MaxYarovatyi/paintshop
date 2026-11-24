-- =============================================================================
-- BASELINE (documentation only)
--
-- ALREADY APPLIED to the live database. DO NOT RUN THIS FILE.
--
-- It records the schema as introspected on 2026-11-24, before the
-- phase1-hardening migrations. It exists so the repository describes the
-- database. Legacy object names (paintings_*, painting_images_*) are kept
-- as they are in the live database, because the tables were renamed in place.
--
-- Not reproduced here: default Supabase grants (anon and authenticated hold
-- every table privilege on all public tables and on the products_public view),
-- storage.buckets rows, and the auth schema.
-- Buckets: "paintings" (public), "briefs" (private, 8 MiB, jpeg/png/webp/heic,
-- no policies, so closed to anon and authenticated).
-- =============================================================================

-- Enums ----------------------------------------------------------------------
create type public.inquiry_status  as enum ('new', 'contacted', 'completed');
create type public.painting_status as enum ('available', 'reserved', 'sold');
create type public.product_type    as enum ('painting', 'object');
create type public.series_status   as enum ('coming', 'live', 'archive');

-- Tables ---------------------------------------------------------------------
create table public.series (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  intro            text not null default '',
  release_date     date,
  status           public.series_status not null default 'coming',
  cover_image_path text,
  cover_image_alt  text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  description         text not null default '',
  price_usd           numeric not null,
  status              public.painting_status not null default 'available',
  width_cm            numeric,
  height_cm           numeric,
  medium              text not null,
  year_created        integer,
  tags                text[] not null default '{}',
  is_featured         boolean not null default false,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  series_id           uuid references public.series(id) on delete set null,
  type                public.product_type not null default 'painting',
  reserved_until      timestamptz,
  reserved_inquiry_id uuid,
  series_position     smallint,
  effort_level        smallint,
  author_comment      text not null default '',
  etsy_url            text,
  depth_cm            numeric,
  constraint products_effort_level_check check (effort_level >= 1 and effort_level <= 3)
);
-- Live constraint names: paintings_pkey, paintings_slug_key, paintings_series_id_fkey

create table public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text     text not null default '',
  sort_order   integer not null default 0,
  is_primary   boolean not null default false
);
-- Live constraint names: painting_images_pkey, painting_images_painting_id_fkey

create table public.inquiries (
  id                uuid primary key default gen_random_uuid(),
  painting_id       uuid not null references public.products(id) on delete cascade,
  buyer_name        text not null,
  buyer_contact     text not null,
  buyer_country     text not null,
  message           text,
  status            public.inquiry_status not null default 'new',
  preferred_channel text not null,
  created_at        timestamptz not null default now()
);
-- Live constraint name: inquiries_painting_id_fkey

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Indexes (besides primary keys and unique constraints) ----------------------
create index painting_images_painting_id_idx on public.product_images (product_id);
create index paintings_series_id_idx         on public.products (series_id);
create index paintings_status_idx            on public.products (status);

-- Functions and triggers -----------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger paintings_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger series_set_updated_at before update on public.series
  for each row execute function public.set_updated_at();

-- View -----------------------------------------------------------------------
create view public.products_public with (security_invoker = true) as
select id, slug, title, description, price_usd, status, width_cm, height_cm,
       medium, year_created, tags, is_featured, sort_order, created_at,
       updated_at, series_id, type, reserved_until, reserved_inquiry_id,
       series_position, effort_level, author_comment, etsy_url, depth_cm,
       case
         when status = 'reserved' and reserved_until is not null and reserved_until <= now()
           then 'available'
         else status::text
       end as effective_status
from public.products p;

-- Row level security: enabled on admins, inquiries, product_images, products, series
alter table public.admins         enable row level security;
alter table public.inquiries      enable row level security;
alter table public.product_images enable row level security;
alter table public.products       enable row level security;
alter table public.series         enable row level security;
-- admins has no policies (only reachable through is_admin()).

-- Policies (public schema) ---------------------------------------------------
create policy "Anyone can submit an inquiry for an available work" on public.inquiries
  for insert to anon
  with check (exists (select 1 from public.products p
                      where p.id = inquiries.painting_id and p.status = 'available'));
create policy "Authenticated can manage inquiries" on public.inquiries
  for all to authenticated using (true) with check (true);

create policy "Authenticated can manage painting images" on public.product_images
  for all to authenticated using (true) with check (true);
create policy "Public can read images of released paintings" on public.product_images
  for select to anon
  using (exists (select 1 from public.products p where p.id = product_images.product_id));

create policy "Authenticated can manage paintings" on public.products
  for all to authenticated using (true) with check (true);
create policy "Public can read released paintings" on public.products
  for select to anon
  using (series_id is null
         or exists (select 1 from public.series s
                    where s.id = products.series_id and s.status <> 'coming'));

create policy "Authenticated can manage series" on public.series
  for all to authenticated using (true) with check (true);
create policy "Public can read series" on public.series
  for select to anon using (true);

-- Policies (storage.objects, bucket "paintings") -----------------------------
create policy "Authenticated can delete painting images" on storage.objects
  for delete to authenticated using (bucket_id = 'paintings');
create policy "Authenticated can update painting images" on storage.objects
  for update to authenticated using (bucket_id = 'paintings');
create policy "Authenticated can upload painting images" on storage.objects
  for insert to authenticated with check (bucket_id = 'paintings');
create policy "Authenticated can view painting files" on storage.objects
  for select to authenticated using (bucket_id = 'paintings');
