import type {CheckoutProvider, OrderIntent, CheckoutResult} from "@/lib/checkout/types";

function buildMessage(order: OrderIntent): string{
    const lines = [
        `Hi! I'm interested in "${order.paintingTitle}.`,
        ``,
        `Name: ${order.buyerName}`,
        `Contact: ${order.buyerContact}`,
        `Country: ${order.buyerCountry}`,
    ];
    if(order.message) lines.push(``, `Message: ${order.message}`);
    return lines.join("\n");
}

export const whatsappProvider: CheckoutProvider = {
    name: "whatsapp",
    async initiate(order:OrderIntent): Promise<CheckoutResult> {
        const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
        if(!phone) throw new Error("Whatsapp number not configured");

        const text = encodeURIComponent(buildMessage(order));
        return {redirectUrl: `https://wa.me/${phone}?text=${text}`};
    },
}
