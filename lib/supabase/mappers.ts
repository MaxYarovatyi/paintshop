import type { Painting, PaintingImage, PaintingStatus } from "../types/painting";

export interface PaintingImageRow {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
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
