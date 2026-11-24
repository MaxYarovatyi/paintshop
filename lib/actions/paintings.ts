// lib/actions/paintings.ts
"use server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { slugify } from "@/lib/utils/slugify";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

const PAINTING_STATUSES = ["available", "reserved", "sold"];

function parsePaintingFields(formData: FormData) {
  const str = (key: string) => ((formData.get(key) as string) || "").trim();
  const title = str("title");
  const status = str("status");
  const priceUsd = Number(formData.get("priceUsd"));
  const widthCm = Number(formData.get("widthCm"));
  const heightCm = Number(formData.get("heightCm"));
  const yearRaw = str("yearCreated");
  const yearCreated = yearRaw ? Number(yearRaw) : null;

  if (!title) throw new Error("Title is required");
  if (!PAINTING_STATUSES.includes(status)) throw new Error("Invalid status");
  if (!Number.isFinite(priceUsd) || priceUsd < 0) throw new Error("Price must be a non-negative number");
  if (!Number.isFinite(widthCm) || widthCm <= 0) throw new Error("Width must be greater than 0");
  if (!Number.isFinite(heightCm) || heightCm <= 0) throw new Error("Height must be greater than 0");
  if (yearCreated !== null && (!Number.isInteger(yearCreated) || yearCreated < 1000 || yearCreated > 3000)) {
    throw new Error("Invalid year");
  }

  const slug = slugify(str("slug") || title);
  if (!slug) throw new Error("Could not generate a slug, please enter one");

  return {
    title,
    slug,
    description: str("description"),
    price_usd: priceUsd,
    status,
    width_cm: widthCm,
    height_cm: heightCm,
    medium: str("medium"),
    year_created: yearCreated,
    tags: str("tags").split(",").map((t) => t.trim()).filter(Boolean),
    is_featured: formData.get("isFeatured") === "on",
    series_id: str("seriesId") || null,
  };
}

export async function createPainting(formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = parsePaintingFields(formData);

  const { data, error } = await supabase.from("products").insert(fields).select("id").single();
  if (error) throw new Error(error.message);

  updateTag("catalog");
  revalidatePath("/admin");
  redirect(`/admin/paintings/${data.id}/edit`);
}

export async function updatePainting(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = parsePaintingFields(formData);

  const { error } = await supabase.from("products").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath(`/admin/paintings/${id}/edit`);
  updateTag("catalog");
  redirect('/admin');
}

export async function deletePainting(id: string) {
  const { supabase } = await requireAdmin();
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  if (images && images.length > 0) {
    await supabase.storage.from("paintings").remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  updateTag("catalog");
  revalidatePath("/admin");
  redirect("/admin");
}

function toDim(v: FormDataEntryValue | undefined): number | null {
  if (typeof v !== "string" || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function uploadPaintingImages(paintingId: string, slug: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  // Pixel sizes are measured in the browser. They only set a display ratio,
  // so a missing or invalid value falls back to null.
  const dim = z.number().int().min(1).max(30000).nullable();
  const sizes = files.map((_, i) => ({
    w: dim.safeParse(toDim(formData.getAll("widths")[i])),
    h: dim.safeParse(toDim(formData.getAll("heights")[i])),
  }));

  const { data: existing } = await supabase
    .from("product_images")
    .select("id, is_primary, sort_order")
    .eq("product_id", paintingId);

  let nextSortOrder = existing && existing.length > 0 ? Math.max(...existing.map((e) => e.sort_order)) + 1 : 0;
  let needsPrimary = !existing?.some((e) => e.is_primary);

  for (const [i, file] of files.entries()) {
    const size = sizes[i];
    const hasSize = size.w.success && size.h.success && size.w.data && size.h.data;
    const path = `${slug}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("paintings").upload(path, file);
    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: paintingId,
      storage_path: path,
      alt_text: "",
      sort_order: nextSortOrder,
      is_primary: needsPrimary,
      width_px: hasSize ? size.w.data : null,
      height_px: hasSize ? size.h.data : null,
    });
    if (insertError) throw new Error(insertError.message);

    nextSortOrder += 1;
    needsPrimary = false;
  }

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  updateTag("catalog");
}

export async function deletePaintingImage(imageId: string, storagePath: string, paintingId: string) {
  const { supabase } = await requireAdmin();
  await supabase.storage.from("paintings").remove([storagePath]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  updateTag("catalog");
}

export async function setPrimaryImage(imageId: string, paintingId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", paintingId);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  updateTag("catalog");
}

export async function moveImage(paintingId:string, imageId: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();
  const {data: images, error} =await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", paintingId)
    .order("sort_order", {ascending: true});

  if(error || !images) throw new Error(error?.message ?? "Could not load images");

  const index = images.findIndex((img)=> img.id === imageId);
  const targetIndex = direction === "up" ? index -1 : index+1;
  if(index === -1 || targetIndex< 0 || targetIndex >= images.length) return;

  const current = images[index];
  const target = images[targetIndex];

  await supabase.from("product_images").update({sort_order: target.sort_order}).eq("id",current.id);
  await supabase.from("product_images").update({sort_order: current.sort_order}).eq("id", target.id);

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  updateTag("catalog");
}

export async function updateImageAltText(imageId:string, paintingId: string, altText: string) {
  const { supabase } = await requireAdmin();
  const {error} = await supabase.from("product_images").update({alt_text:altText}).eq("id", imageId);
  if(error) throw new Error(error.message);

  updateTag("catalog");
  revalidatePath(`/admin/paintings/${paintingId}/edit`);
}