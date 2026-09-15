// app/admin/(protected)/page.tsx
import Link from "next/link";
import { getPaintings } from "@/lib/supabase/queries";
import { deletePainting } from "@/lib/actions/paintings";
import { formatPrice } from "@/lib/utils/formatPrice";

export default async function AdminPaintingsPage() {
  const paintings = await getPaintings();

  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">Paintings</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-muted border-b border-neutral-200">
            <th className="py-2">Title</th>
            <th className="py-2">Status</th>
            <th className="py-2">Price</th>
            <th className="py-2">Featured</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {paintings.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100">
              <td className="py-3">{p.title}</td>
              <td className="py-3">{p.status}</td>
              <td className="py-3">{formatPrice(p.priceUsd)}</td>
              <td className="py-3">{p.isFeatured ? "Yes" : ""}</td>
              <td className="py-3 flex gap-4">
                <Link href={`/admin/paintings/${p.id}/edit`} className="underline">Edit</Link>
                <form action={deletePainting.bind(null, p.id)}>
                  <button type="submit" className="text-red-600">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}