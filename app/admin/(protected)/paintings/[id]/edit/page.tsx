// app/admin/(protected)/paintings/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import PaintingForm from "@/components/admin/PaintingForm";
import ImageManager from "@/components/admin/ImageManager";
import { getPaintingById } from "@/lib/supabase/queries";
import { updatePainting } from "@/lib/actions/paintings";

export default async function EditPaintingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const painting = await getPaintingById(id);
  if (!painting) notFound();

  const updateWithId = updatePainting.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">Edit painting</h1>
      <PaintingForm painting={painting} action={updateWithId} />

      <div className="mt-12 max-w-xl">
        <h2 className="font-serif text-xl mb-4">Images</h2>
        <ImageManager painting={painting} />
      </div>
    </div>
  );
}