import Link from "next/link";
import { getInquiries } from "@/lib/supabase/queries";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";
import { formatSource } from "@/lib/attribution/attribution";
import type { Inquiry } from "@/lib/types/inquiry";

function sourceTitle(inq: Inquiry): string | undefined {
  const u = inq.utm;
  if (!u) return undefined;
  const parts = [
    u.campaign && `Campaign: ${u.campaign}`,
    u.landing_path && `Landing: ${u.landing_path}`,
    u.referrer_host && `Referrer: ${u.referrer_host}`,
    u.first_seen_at && `First seen: ${new Date(u.first_seen_at).toLocaleString()}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : undefined;
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string | string[] }>;
}) {
  const { source } = await searchParams;
  const activeSource = typeof source === "string" ? source : "";

  const all = await getInquiries();
  const sources = Array.from(new Set(all.map((i) => i.source))).sort();
  const inquiries = activeSource ? all.filter((i) => i.source === activeSource) : all;

  const filterClass = (active: boolean) =>
    active ? "text-ink" : "text-ink-muted hover:text-ink";

  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">Inquiries</h1>

      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm">
          <span className="text-xs uppercase tracking-wide text-ink-muted">Source</span>
          <Link href="/admin/inquiries" className={filterClass(!activeSource)}>
            All
          </Link>
          {sources.map((s) => (
            <Link
              key={s}
              href={`/admin/inquiries?source=${encodeURIComponent(s)}`}
              className={filterClass(activeSource === s)}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-muted border-b border-neutral-200">
            <th className="py-2">Painting</th>
            <th className="py-2">Buyer</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Country</th>
            <th className="py-2">Via</th>
            <th className="py-2">Source</th>
            <th className="py-2">Received</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => {
            const title = sourceTitle(inq);
            return (
              <tr key={inq.id} className="border-b border-neutral-100 align-top">
                <td className="py-3">
                  {inq.painting ? (
                    <Link
                      href={`/admin/paintings/${inq.paintingId}/edit`}
                      className="underline"
                    >
                      {inq.painting.title}
                    </Link>
                  ) : (
                    <span className="text-neutral-400">(deleted)</span>
                  )}
                </td>
                <td className="py-3">{inq.buyerName}</td>
                <td className="py-3">{inq.buyerContact}</td>
                <td className="py-3">{inq.buyerCountry}</td>
                <td className="py-3">
                  <span className="text-xs uppercase tracking-wide bg-neutral-200 px-2 py-1">
                    {inq.preferredChannel}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    title={title}
                    className={title ? "underline decoration-dotted underline-offset-4 cursor-help" : undefined}
                  >
                    {formatSource(inq.source, inq.utm?.medium)}
                  </span>
                </td>
                <td className="py-3 text-ink-muted">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <InquiryStatusSelect inquiryId={inq.id} status={inq.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {inquiries.length === 0 && (
        <p className="text-ink-muted py-10">
          {activeSource ? "No inquiries from this source." : "No inquiries yet."}
        </p>
      )}
    </div>
  );
}
