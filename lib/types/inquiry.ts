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
}