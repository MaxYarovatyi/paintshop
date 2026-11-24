// lib/actions/series.ts
"use server";
import type { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { slugify } from "@/lib/utils/slugify";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";

const STATUSES = ["coming", "live", "archive"];

function parseSeriesFields(formData: FormData) {
  const title = ((formData.get("title") as string) || "").trim();
  const status = formData.get("status") as string;
  const releaseDate = (formData.get("releaseDate") as string) || null;

  if (!title) throw new Error("Title is required");
  if (!STATUSES.includes(status)) throw new Error("Invalid status");
  if (status === "coming" && !releaseDate) throw new Error("A coming series needs a release date");

  return {
    title,
    intro: ((formData.get("intro") as string) || "").trim(),
    release_date: releaseDate,
    status,
    cover_image_alt: ((formData.get("coverImageAlt") as string) || "").trim(),
  };
}

function getCoverFile(formData: FormData): File | null {
  const file = formData.get("cover");
  return file instanceof File && file.size > 0 ? file : null;
}

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `series/${slug}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("paintings").upload(path, file);
  if (error) throw new Error(error.message);
  return path;
}

export async function createSeries(formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = parseSeriesFields(formData);
  const slug = (((formData.get("slug") as string) || "").trim() || slugify(fields.title));
  const cover = getCoverFile(formData);
  const cover_image_path = cover ? await uploadCover(supabase, slug, cover) : null;

  const { data, error } = await supabase
    .from("series")
    .insert({ ...fields, slug, cover_image_path })
    .select("id")
    .single();

  if (error) {
    if (cover_image_path) await supabase.storage.from("paintings").remove([cover_image_path]);
    throw new Error(error.message);
  }

  updateTag("catalog");
  revalidatePath("/admin/series");
  redirect(`/admin/series/${data.id}/edit`);
}

export async function updateSeries(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = parseSeriesFields(formData); // slug is intentionally not updatable
  const cover = getCoverFile(formData);

  const update: Record<string, unknown> = { ...fields };
  let oldCoverPath: string | null = null;

  if (cover) {
    const { data: existing } = await supabase
      .from("series")
      .select("slug, cover_image_path")
      .eq("id", id)
      .single();
    if (!existing) throw new Error("Series not found");
    oldCoverPath = existing.cover_image_path;
    update.cover_image_path = await uploadCover(supabase, existing.slug, cover);
  }

  const { error } = await supabase.from("series").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  if (oldCoverPath) await supabase.storage.from("paintings").remove([oldCoverPath]);

  revalidatePath("/admin/series");
  revalidatePath(`/admin/series/${id}/edit`);
  updateTag("catalog");
}

export async function deleteSeries(id: string) {
  const { supabase } = await requireAdmin();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("series_id", id);
  if (count && count > 0) throw new Error("This series still has works. Reassign them first.");

  const { data: existing } = await supabase
    .from("series")
    .select("cover_image_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (existing?.cover_image_path) {
    await supabase.storage.from("paintings").remove([existing.cover_image_path]);
  }

  updateTag("catalog");
  revalidatePath("/admin/series");
  redirect("/admin/series");
}