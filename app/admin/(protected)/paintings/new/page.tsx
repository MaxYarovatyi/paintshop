// app/admin/(protected)/paintings/new/page.tsx
import PaintingForm from "@/components/admin/PaintingForm";
import { createPainting } from "@/lib/actions/paintings";
import { getAllSeries } from "@/lib/supabase/queries";

export default async function NewPaintingPage() {
  const seriesList = await getAllSeries();
  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">New painting</h1>
      <PaintingForm
        action={createPainting}
        seriesOptions={seriesList.map((s) => ({ id: s.id, title: s.title }))}
      />
    </div>
  );
}
