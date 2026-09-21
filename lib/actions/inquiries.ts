"use server"
import { createClient } from "../supabase/server"
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "../notifications/telegram";
import { InquiryIntent } from "../inquiries/types";
import { validateContact } from "../inquiries/validation";

export async function submitInquiry(order: InquiryIntent, preferredChannel: string) {
    if(!validateContact(preferredChannel, order.buyerContact)) {
        throw new Error("Invalid contact info");
    }
    
    const supabase = await createClient();

    const { error } = await supabase.from("inquiries").insert({
        painting_id: order.paintingId,
        buyer_name: order.buyerName,
        buyer_contact: order.buyerContact,
        buyer_country: order.buyerCountry,
        message: order.message ?? null,
        status: "new",
        preferred_channel: preferredChannel
    });

    if (error) {
        console.error("submitInquiry error:", error.message);
        throw new Error("Could not submit inquiry");
    }

    await sendTelegramNotification(
        `<b>New inquiry</b>\n"${order.paintingTitle}"\n\n` + 
        `Name: ${order.buyerName}\nContact: ${order.buyerContact}\nCountry: ${order.buyerCountry}\n` +
        `Prefers: ${preferredChannel}${order.message ? `\nMessage: ${order.message}` : ""}`
    );
}

export async function updateInquiryStatus(id: string, status: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
}