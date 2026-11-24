
export interface InquiryIntent {
    paintingId: string;
    paintingTitle: string;
    paintingSlug: string;
    buyerName: string;
    buyerContact: string;
    buyerCountry: string;
    message?: string;
}

export const CONTACT_CHANNELS = [
    {name: "whatsapp", label: "WhatsApp"},
    {name: "telegram", label: "Telegram"},
    {name: "viber", label: "Viber"},
    {name: "instagram", label: "Instagram"}
] as const;