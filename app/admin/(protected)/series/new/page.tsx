// app/admin/(protected)/series/new/page.tsx
import SeriesForm from "@/components/admin/SeriesForm";
import { createSeries } from "@/lib/actions/series";

export default function NewSeriesPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">New series</h1>
      <SeriesForm action={createSeries} />
    </div>
  );
}