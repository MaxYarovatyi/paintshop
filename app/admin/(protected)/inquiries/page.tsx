import Link from "next/link";
import { getInquiries } from "@/lib/supabase/queries";
import { updateInquiryStatus } from "@/lib/actions/inquiries";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div>
      <h1 className="font-serif text-2xl mb-8">Inquiries</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-muted border-b border-neutral-200">
            <th className="py-2">Painting</th>
            <th className="py-2">Buyer</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Country</th>
            <th className="py-2">Via</th>
            <th className="py-2">Received</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => (
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
              <td className="py-3 text-ink-muted">
                {new Date(inq.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3">
                <InquiryStatusSelect inquiryId={inq.id} status={inq.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {inquiries.length === 0 && (
        <p className="text-ink-muted py-10">No inquiries yet.</p>
      )}
    </div>
  );
}
