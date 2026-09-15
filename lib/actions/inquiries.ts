"use server"
import { createClient } from "../supabase/server"
import { whatsappProvider } from "../checkout/providers/whatsapp"
import type { OrderIntent } from "../checkout/types"
import { revalidatePath } from "next/cache";

export async function submitInquiry(order:OrderIntent) {
    const supabase = await createClient();

    const {error} = await supabase.from("inquiries").insert({
         painting_id: order.paintingId,
        buyer_name: order.buyerName,
        buyer_contact: order.buyerContact,
        buyer_country: order.buyerCountry,
        message: order.message ?? null,
        status: "new",
        provider: whatsappProvider.name
    });

    if(error)
    {
        console.error("submitInquiry error:", error.message);
        throw new Error("Could not submit inquiry");
    }

    const result = await whatsappProvider.initiate(order);
    return result.redirectUrl;
}

export async function updateInquiryStatus(id:string, status: string) {
    const supabase = await createClient();
    const {error} = await supabase.from("inquiries").update({status}).eq("id",id);
    if(error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
}