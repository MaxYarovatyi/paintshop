import type { InquiryStatus } from "@/lib/inquiries/status";

export type { InquiryStatus };

export interface Inquiry
{
    id: string;
    paintingId: string | null;
    buyerName: string;
    buyerContact: string;
    buyerCountry: string;
    message: string | null;
    status: InquiryStatus;
    createdAt: string; 
    preferredChannel: string;
    painting?: {title: string; slug: string};
    source: string;
    utm: InquiryUtm | null;
}

/** Stored in inquiries.utm by the public inquiry action. */
export interface InquiryUtm {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    landing_path?: string | null;
    referrer_host?: string | null;
    first_seen_at?: string | null;
}