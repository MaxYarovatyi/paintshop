"use client";
import { useTransition } from "react";
import { updateInquiryStatus } from "@/lib/actions/inquiries";

import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS } from "@/lib/inquiries/status";

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
      {INQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>{INQUIRY_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}