export interface OrderIntent {
    paintingId: string;
    paintingTitle: string;
    paintingSlug: string;
    buyerName: string;
    buyerContact: string;
    buyerCountry: string;
    message?: string;
}

export interface CheckoutResult {
    redirectUrl: string;
}

export interface CheckoutProvider
{
    name: string;
    initiate(order: OrderIntent): Promise<CheckoutResult>;
}