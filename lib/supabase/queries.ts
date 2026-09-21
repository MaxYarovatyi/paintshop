import { createClient } from "./server";
import type { Painting, PaintingImage, PaintingStatus } from "../types/painting";
import { Inquiry } from "../types/inquiry";

interface InquiryRow {
  id: string;
  painting_id: string;
  buyer_name: string;
  buyer_country: string;
  buyer_contact: string;
  message: string | null;
  status: string;
  preferred_channel: string;
  created_at: string;
  paintings: { title: string; slug: string } | null;
}

interface PaintingRow {
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
  painting_images: PaintingImageRow[];
}

function mapInquiry(row: InquiryRow) {
  return {
    id: row.id,
    paintingId: row.painting_id,
    buyerName: row.buyer_name,
    buyerContact: row.buyer_contact,
    buyerCountry: row.buyer_country,
    message: row.message,
    status: row.status as Inquiry["status"],
    preferredChannel: row.preferred_channel,
    createdAt: row.created_at,
    painting: row.paintings ?? undefined
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, paintings(title, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getInquiries error:", error.message);
    return [];
  }
  return (data as InquiryRow[]).map(mapInquiry);
}

interface PaintingImageRow {
  id: string;
  painting_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

function mapImage(row: PaintingImageRow): PaintingImage {
  return {
    id: row.id,
    paintingId: row.painting_id,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary
  }
}

function mapPainting(row: PaintingRow): Painting {
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
    images: (row.painting_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapImage),
  };
}


export async function getPaintings(filters?: { tag?: string; availableOnly?: boolean }): Promise<Painting[]> {
  const supabase = await createClient();
  let query = supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .order("sort_order", { ascending: true });

  if (filters?.tag) {
    query = query.contains("tags", [filters.tag])
  }
  if (filters?.availableOnly) {
    query = query.eq("status", "available");
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPaintings error:", error.message)
    return [];
  }
  return (data as PaintingRow[]).map(mapPainting);
}

export async function getFeaturedPaintings(): Promise<Painting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getFeaturedPaintings error:", error.message);
    return [];
  }
  return (data as PaintingRow[]).map(mapPainting);
}

export async function getPaintingBySlug(slug: string): Promise<Painting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getPaintingBySlug error:", error.message);
    return null;
  }
  return mapPainting(data as PaintingRow);
}

export async function getPaintingById(id: string): Promise<Painting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getPaintingById error:", error.message);
    return null;
  }
  return mapPainting(data as PaintingRow);
}

export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("paintings").select("tags");

  if (error) {
    console.error("getAllTags error:", error.message);
    return [];
  }

  const allTags = (data as { tags: string[] }[]).flatMap((row) => row.tags);
  return Array.from(new Set(allTags)).sort();
}