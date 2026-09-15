// app/admin/(protected)/paintings/new/page.tsx
import PaintingForm from "@/components/admin/PaintingForm";
import { createPainting } from "@/lib/actions/paintings";

export default function NewPaintingPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">New painting</h1>
      <PaintingForm action={createPainting} />
    </div>
  );
}