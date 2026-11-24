import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./public";
import { mapPainting, mapSeries, type PaintingRow, type SeriesRow } from "./mappers";
import type { Painting } from "../types/painting";
import type { Series } from "../types/series";

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

/** Most recently released live series with a few of its works, or null when none is live. */
export async function getLiveSeries(
  limit = 5,
): Promise<{ series: Series; paintings: Painting[] } | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(CATALOG_TAG);

  const supabase = createPublicClient();
  const { data: seriesRow, error } = await supabase
    .from("series")
    .select("*")
    .eq("status", "live")
    .order("release_date", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLiveSeries: ${error.message}`);
  if (!seriesRow) return null;

  const { data, error: worksError } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("series_id", seriesRow.id)
    .order("series_position", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (worksError) throw new Error(`getLiveSeries works: ${worksError.message}`);

  return {
    series: mapSeries(seriesRow as SeriesRow),
    paintings: (data as PaintingRow[]).map(mapPainting),
  };
}
