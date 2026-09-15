"use client";
import { useTransition } from "react";
import { updateInquiryStatus } from "@/lib/actions/inquiries";

const STATUSES = ["new", "contacted", "completed"] as const;

export default function InquiryStatusSelect({
    inquiryId,
    status,
} : {
    inquiryId: string;
    status: string;
}) {
    const [isPending, startTransition] = useTransition();

    return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateInquiryStatus(inquiryId, e.target.value))}
      className="border border-neutral-300 px-2 py-1 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}