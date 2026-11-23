// app/admin/(protected)/series/page.tsx
import Link from "next/link";
import { getAllSeries, getPaintings } from "@/lib/supabase/queries";
import { deleteSeries } from "@/lib/actions/series";

const STATUS_LABEL = { coming: "Coming soon", live: "Live", archive: "Archive" } as const;

export default async function AdminSeriesPage() {
  const [seriesList, paintings] = await Promise.all([getAllSeries(), getPaintings()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl">Series</h1>
        <Link href="/admin/series/new" className="underline text-sm">+ New series</Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-muted border-b border-canvas-border">
            <th className="py-2">Title</th>
            <th className="py-2">Status</th>
            <th className="py-2">Release</th>
            <th className="py-2">Works</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {seriesList.map((s) => (
            <tr key={s.id} className="border-b border-canvas-border">
              <td className="py-3">{s.title}</td>
              <td className="py-3">{STATUS_LABEL[s.status]}</td>
              <td className="py-3">{s.releaseDate ?? ""}</td>
              <td className="py-3">{paintings.filter((p) => p.seriesId === s.id).length}</td>
              <td className="py-3 flex gap-4">
                <Link href={`/admin/series/${s.id}/edit`} className="underline">Edit</Link>
                <form action={deleteSeries.bind(null, s.id)}>
                  <button type="submit" className="text-red-600">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {seriesList.length === 0 && <p className="text-ink-muted py-10">No series yet.</p>}
    </div>
  );
}