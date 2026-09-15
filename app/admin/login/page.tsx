// app/admin/login/page.tsx
import { signIn } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <form action={signIn} className="w-full max-w-sm space-y-4 p-8">
        <h1 className="font-serif text-2xl mb-6">Admin login</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input name="email" type="email" placeholder="Email" required
          className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900" />
        <button type="submit" className="w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-wide">
          Log in
        </button>
      </form>
    </div>
  );
}