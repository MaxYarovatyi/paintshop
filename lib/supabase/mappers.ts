import type { Painting, PaintingImage, PaintingStatus } from "../types/painting";
import type { Series, SeriesStatus } from "../types/series";

export interface PaintingImageRow {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  width_px: number | null;
  height_px: number | null;
}

export interface PaintingRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_usd: number;
  status: PaintingStatus;
  width_cm: number;
  height_cm: number;
  medium: string;
  year_created: number | null;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_images: PaintingImageRow[];
  series_id: string | null;
}

function mapImage(row: PaintingImageRow): PaintingImage {
  return {
    id: row.id,
    paintingId: row.product_id,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    widthPx: row.width_px ?? null,
    heightPx: row.height_px ?? null,
  };
}

export function mapPainting(row: PaintingRow): Painting {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    priceUsd: row.price_usd,
    status: row.status,
    widthCm: row.width_cm,
    heightCm: row.height_cm,
    medium: row.medium,
    yearCreated: row.year_created,
    tags: row.tags,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: (row.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapImage),
    seriesId: row.series_id,
  };
}

export interface SeriesRow {
  id: string;
  slug: string;
  title: string;
  intro: string;
  release_date: string | null;
  status: SeriesStatus;
  cover_image_path: string | null;
  cover_image_alt: string;
  created_at: string;
  updated_at: string;
}

export function mapSeries(row: SeriesRow): Series {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    intro: row.intro,
    releaseDate: row.release_date,
    status: row.status,
    coverImagePath: row.cover_image_path,
    coverImageAlt: row.cover_image_alt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
