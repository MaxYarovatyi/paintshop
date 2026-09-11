interface OrderIntent {
    paintingId: string;
    buyerName: string;
    buyerContact: string;
    buyerCountry: string;
    message?: string;
}

interface CheckoutProvider
{
    initiate(order: OrderIntent): Promise<{redirectUrl?: string;}>;
}