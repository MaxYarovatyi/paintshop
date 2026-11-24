import { createClient } from "./server";
import type { Painting } from "../types/painting";
import { mapPainting, type PaintingRow } from "./mappers";
import { Inquiry } from "../types/inquiry";
import type { Series, SeriesStatus } from "../types/series";

interface InquiryRow {
  id: string;
  product_id: string | null;
  buyer_name: string;
  buyer_country: string;
  buyer_contact: string;
  message: string | null;
  status: string;
  preferred_channel: string;
  created_at: string;
  products: { title: string; slug: string } | null;
}

interface SeriesRow {
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

function mapSeries(row: SeriesRow): Series {
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

export async function getAllSeries(): Promise<Series[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("release_date", { ascending: false, nullsFirst: true });

  if (error) {
    console.error("getAllSeries error:", error.message);
    return [];
  }
  return (data as SeriesRow[]).map(mapSeries);
}

export async function getSeriesById(id: string): Promise<Series | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("series").select("*").eq("id", id).single();
  if (error) {
    console.error("getSeriesById error:", error.message);
    return null;
  }
  return mapSeries(data as SeriesRow);
}

function mapInquiry(row: InquiryRow) {
  return {
    id: row.id,
    paintingId: row.product_id,
    buyerName: row.buyer_name,
    buyerContact: row.buyer_contact,
    buyerCountry: row.buyer_country,
    message: row.message,
    status: row.status as Inquiry["status"],
    preferredChannel: row.preferred_channel,
    createdAt: row.created_at,
    painting: row.products ?? undefined
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, products(title, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getInquiries error:", error.message);
    return [];
  }
  return (data as InquiryRow[]).map(mapInquiry);
}

export async function getPaintings(): Promise<Painting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPaintings error:", error.message);
    return [];
  }
  return (data as PaintingRow[]).map(mapPainting);
}

export async function getPaintingById(id: string): Promise<Painting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getPaintingById error:", error.message);
    return null;
  }
  return mapPainting(data as PaintingRow);
}
