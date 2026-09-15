// app/admin/(protected)/layout.tsx
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 px-8 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-serif text-lg">Admin</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/admin/paintings/new">+ New painting</Link>
          <Link href="/admin/inquiries">Inquiries</Link>
          <form action={signOut}>
            <button type="submit" className="text-neutral-500">Log out</button>
          </form>
        </nav>
      </header>
      <main className="px-8 py-10">{children}</main>
    </div>
  );
}