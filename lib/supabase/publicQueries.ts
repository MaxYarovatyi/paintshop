import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./public";
import { mapPainting, type PaintingRow } from "./mappers";
import type { Painting } from "../types/painting";

/** Tag invalidated by admin actions whenever public catalog data changes. */
export const CATALOG_TAG = "catalog";

// Errors are thrown, not turned into empty lists: a failed read must never be cached
// as "no works". Cached data is refreshed at most hourly.

export async function getPublicPaintings(): Promise<Painting[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(CATALOG_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getPublicPaintings: ${error.message}`);
  return (data as PaintingRow[]).map(mapPainting);
}

export async function getPublicPaintingBySlug(slug: string): Promise<Painting | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(CATALOG_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getPublicPaintingBySlug: ${error.message}`);
  return data ? mapPainting(data as PaintingRow) : null;
}
