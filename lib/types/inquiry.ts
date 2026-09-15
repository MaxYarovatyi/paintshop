export type InquiryStatus = "new" | "contacted" | "completed";

export interface Inquiry
{
    id: string;
    paintingId: string;
    buyerName: string;
    buyerContact: string;
    buyerCountry: string;
    message: string | null;
    status: InquiryStatus;
    createdAt: string; 
    provider: string;
    painting?: {title: string; slug: string};
}