// app/admin/(protected)/series/[id]/edit/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import SeriesForm from "@/components/admin/SeriesForm";
import { getSeriesById, getPaintings } from "@/lib/supabase/queries";
import { updateSeries } from "@/lib/actions/series";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [series, paintings] = await Promise.all([getSeriesById(id), getPaintings()]);
  if (!series) notFound();

  const works = paintings.filter((p) => p.seriesId === id);

  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">Edit series</h1>
      <SeriesForm series={series} action={updateSeries.bind(null, id)} />

      <div className="mt-12 max-w-xl">
        <h2 className="font-serif text-xl mb-2">Works in this series</h2>
        <p className="text-xs text-ink-muted mb-4">Assign works from each painting&apos;s edit page.</p>
        {works.length === 0 ? (
          <p className="text-sm text-ink-muted">None yet.</p>
        ) : (
          <ul className="text-sm space-y-2">
            {works.map((w) => (
              <li key={w.id}>
                <Link href={`/admin/paintings/${w.id}/edit`} className="underline">{w.title}</Link>
                <span className="text-ink-muted"> · {w.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}