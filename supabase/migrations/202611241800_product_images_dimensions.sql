-- Phase 1, UI audit item 6: store each image's pixel size so cards can use the
-- real photo ratio. Nullable: existing images have no value and fall back to
-- the canvas size in cm. Safe to re-run. Never drops data.

alter table public.product_images
  add column if not exists width_px integer,
  add column if not exists height_px integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_images_dimensions_check'
      and conrelid = 'public.product_images'::regclass
  ) then
    alter table public.product_images
      add constraint product_images_dimensions_check
      check (
        (width_px is null and height_px is null)
        or (width_px > 0 and height_px > 0)
      );
  end if;
end $$;
