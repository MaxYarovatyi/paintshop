// lib/actions/paintings.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function parsePaintingFields(formData: FormData) {
  return {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string) || slugify(formData.get("title") as string),
    description: (formData.get("description") as string) || "",
    price_usd: Number(formData.get("priceUsd")),
    status: formData.get("status") as string,
    width_cm: Number(formData.get("widthCm")),
    height_cm: Number(formData.get("heightCm")),
    medium: formData.get("medium") as string,
    year_created: formData.get("yearCreated") ? Number(formData.get("yearCreated")) : null,
    tags: (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean),
    is_featured: formData.get("isFeatured") === "on",
  };
}

export async function createPainting(formData: FormData) {
  const supabase = await createClient();
  const fields = parsePaintingFields(formData);

  const { data, error } = await supabase.from("paintings").insert(fields).select("id").single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  redirect(`/admin/paintings/${data.id}/edit`);
}

export async function updatePainting(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = parsePaintingFields(formData);

  const { error } = await supabase.from("paintings").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath(`/admin/paintings/${id}/edit`);
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function deletePainting(id: string) {
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("painting_images")
    .select("storage_path")
    .eq("painting_id", id);

  if (images && images.length > 0) {
    await supabase.storage.from("paintings").remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from("paintings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function uploadPaintingImages(paintingId: string, slug: string, formData: FormData) {
  const supabase = await createClient();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  const { data: existing } = await supabase
    .from("painting_images")
    .select("id, is_primary, sort_order")
    .eq("painting_id", paintingId);

  let nextSortOrder = existing && existing.length > 0 ? Math.max(...existing.map((e) => e.sort_order)) + 1 : 0;
  let needsPrimary = !existing?.some((e) => e.is_primary);

  for (const file of files) {
    const path = `${slug}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("paintings").upload(path, file);
    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await supabase.from("painting_images").insert({
      painting_id: paintingId,
      storage_path: path,
      alt_text: "",
      sort_order: nextSortOrder,
      is_primary: needsPrimary,
    });
    if (insertError) throw new Error(insertError.message);

    nextSortOrder += 1;
    needsPrimary = false;
  }

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function deletePaintingImage(imageId: string, storagePath: string, paintingId: string) {
  const supabase = await createClient();
  await supabase.storage.from("paintings").remove([storagePath]);
  const { error } = await supabase.from("painting_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function setPrimaryImage(imageId: string, paintingId: string) {
  const supabase = await createClient();
  await supabase.from("painting_images").update({ is_primary: false }).eq("painting_id", paintingId);
  const { error } = await supabase.from("painting_images").update({ is_primary: true }).eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/paintings/${paintingId}/edit`);
  revalidatePath("/gallery");
  revalidatePath("/");
}